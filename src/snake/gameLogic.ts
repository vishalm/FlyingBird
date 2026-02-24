export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export type GameStatus = 'ready' | 'running' | 'paused' | 'gameOver';

export interface SnakeGameState {
  cols: number;
  rows: number;
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: Point;
  score: number;
  status: GameStatus;
}

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const pointKey = ({ x, y }: Point): string => `${x},${y}`;

const pointsEqual = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

export const isOutOfBounds = (point: Point, cols: number, rows: number): boolean => {
  return point.x < 0 || point.x >= cols || point.y < 0 || point.y >= rows;
};

const moveHead = (head: Point, direction: Direction): Point => {
  if (direction === 'up') return { x: head.x, y: head.y - 1 };
  if (direction === 'down') return { x: head.x, y: head.y + 1 };
  if (direction === 'left') return { x: head.x - 1, y: head.y };
  return { x: head.x + 1, y: head.y };
};

export const placeFood = (
  cols: number,
  rows: number,
  occupied: Point[],
  randomFn: () => number = Math.random,
): Point | null => {
  const occupiedKeys = new Set(occupied.map(pointKey));
  const available: Point[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const cell = { x, y };
      if (!occupiedKeys.has(pointKey(cell))) {
        available.push(cell);
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * available.length);
  return available[Math.min(index, available.length - 1)];
};

export const createInitialState = (
  cols: number,
  rows: number,
  randomFn: () => number = Math.random,
): SnakeGameState => {
  const headX = Math.max(2, Math.floor(cols / 2));
  const headY = Math.floor(rows / 2);
  const snake: Point[] = [
    { x: headX, y: headY },
    { x: headX - 1, y: headY },
    { x: headX - 2, y: headY },
  ];
  const food = placeFood(cols, rows, snake, randomFn) ?? { x: 0, y: 0 };

  return {
    cols,
    rows,
    snake,
    direction: 'right',
    queuedDirection: null,
    food,
    score: 0,
    status: 'ready',
  };
};

export const queueDirection = (state: SnakeGameState, nextDirection: Direction): SnakeGameState => {
  const directionToCheck = state.queuedDirection ?? state.direction;
  if (OPPOSITE_DIRECTION[directionToCheck] === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection,
  };
};

export const startGame = (state: SnakeGameState): SnakeGameState => {
  if (state.status !== 'ready') {
    return state;
  }

  return {
    ...state,
    status: 'running',
  };
};

export const togglePause = (state: SnakeGameState): SnakeGameState => {
  if (state.status === 'running') {
    return { ...state, status: 'paused' };
  }
  if (state.status === 'paused') {
    return { ...state, status: 'running' };
  }
  return state;
};

export const stepGame = (
  state: SnakeGameState,
  randomFn: () => number = Math.random,
): SnakeGameState => {
  if (state.status !== 'running') {
    return state;
  }

  const direction = state.queuedDirection ?? state.direction;
  const nextHead = moveHead(state.snake[0], direction);

  if (isOutOfBounds(nextHead, state.cols, state.rows)) {
    return {
      ...state,
      direction,
      queuedDirection: null,
      status: 'gameOver',
    };
  }

  const willEatFood = pointsEqual(nextHead, state.food);
  const collisionBody = willEatFood ? state.snake : state.snake.slice(0, -1);
  const collision = collisionBody.some(segment => pointsEqual(segment, nextHead));

  if (collision) {
    return {
      ...state,
      direction,
      queuedDirection: null,
      status: 'gameOver',
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEatFood) {
    nextSnake.pop();
  }

  if (!willEatFood) {
    return {
      ...state,
      snake: nextSnake,
      direction,
      queuedDirection: null,
    };
  }

  const nextFood = placeFood(state.cols, state.rows, nextSnake, randomFn);

  if (!nextFood) {
    return {
      ...state,
      snake: nextSnake,
      direction,
      queuedDirection: null,
      score: state.score + 1,
      status: 'gameOver',
    };
  }

  return {
    ...state,
    snake: nextSnake,
    food: nextFood,
    direction,
    queuedDirection: null,
    score: state.score + 1,
  };
};
