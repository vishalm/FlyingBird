import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Direction,
  SnakeGameState,
  createInitialState,
  queueDirection,
  startGame,
  stepGame,
  togglePause,
} from './gameLogic';

const GRID_COLS = 16;
const GRID_ROWS = 20;
const TICK_MS = 130;

const statusLabel = (status: SnakeGameState['status']): string => {
  if (status === 'ready') return 'Press Start';
  if (status === 'running') return 'Running';
  if (status === 'paused') return 'Paused';
  return 'Game Over';
};

export default function SnakeGame() {
  const { width } = useWindowDimensions();
  const [game, setGame] = useState(() => createInitialState(GRID_COLS, GRID_ROWS));

  const cellSize = useMemo(() => {
    const boardSpace = Math.max(240, Math.min(width - 24, 480));
    return Math.floor(boardSpace / GRID_COLS);
  }, [width]);

  const boardWidth = cellSize * GRID_COLS;

  const snakeCells = useMemo(() => {
    const cells = new Set<string>();
    for (const segment of game.snake) {
      cells.add(`${segment.x},${segment.y}`);
    }
    return cells;
  }, [game.snake]);

  useEffect(() => {
    if (game.status !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setGame(prev => stepGame(prev));
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [game.status]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof (globalThis as any).window === 'undefined') {
      return;
    }

    const windowObj = (globalThis as any).window;

    const onKeyDown = (event: any) => {
      const key = event.key?.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        setGame(prev => queueDirection(prev, 'up'));
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        setGame(prev => queueDirection(prev, 'down'));
      } else if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        setGame(prev => queueDirection(prev, 'left'));
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        setGame(prev => queueDirection(prev, 'right'));
      } else if (key === 'p') {
        event.preventDefault();
        setGame(prev => togglePause(prev));
      } else if (key === 'r') {
        event.preventDefault();
        setGame(createInitialState(GRID_COLS, GRID_ROWS));
      }
    };

    windowObj.addEventListener('keydown', onKeyDown);
    return () => windowObj.removeEventListener('keydown', onKeyDown);
  }, []);

  const onDirectionPress = (direction: Direction) => {
    setGame(prev => queueDirection(prev, direction));
  };

  const onStartPausePress = () => {
    setGame(prev => {
      if (prev.status === 'ready') return startGame(prev);
      return togglePause(prev);
    });
  };

  const onRestartPress = () => {
    setGame(createInitialState(GRID_COLS, GRID_ROWS));
  };

  const boardCells = [];
  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const key = `${x},${y}`;
      const isHead = game.snake[0].x === x && game.snake[0].y === y;
      const isSnake = snakeCells.has(key);
      const isFood = game.food.x === x && game.food.y === y;

      boardCells.push(
        <View
          key={key}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
            },
            isSnake && styles.snakeCell,
            isHead && styles.snakeHead,
            isFood && styles.foodCell,
          ]}
        />,
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Snake</Text>
        <Text style={styles.meta}>Score: {game.score}</Text>
        <Text style={styles.meta}>Status: {statusLabel(game.status)}</Text>

        <View
          style={[
            styles.board,
            {
              width: boardWidth,
            },
          ]}
        >
          {boardCells}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onStartPausePress}>
            <Text style={styles.actionButtonText}>
              {game.status === 'running' ? 'Pause' : game.status === 'paused' ? 'Resume' : 'Start'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onRestartPress}>
            <Text style={styles.actionButtonText}>Restart</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={() => onDirectionPress('up')}>
            <Text style={styles.controlButtonText}>Up</Text>
          </TouchableOpacity>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => onDirectionPress('left')}>
              <Text style={styles.controlButtonText}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => onDirectionPress('down')}>
              <Text style={styles.controlButtonText}>Down</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => onDirectionPress('right')}>
              <Text style={styles.controlButtonText}>Right</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 12,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
  },
  meta: {
    marginTop: 4,
    fontSize: 16,
    color: '#444',
  },
  board: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
  },
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#efefef',
    backgroundColor: '#fff',
  },
  snakeCell: {
    backgroundColor: '#2f855a',
  },
  snakeHead: {
    backgroundColor: '#276749',
  },
  foodCell: {
    backgroundColor: '#e53e3e',
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2d3748',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  controlsContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  controlsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#4a5568',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
