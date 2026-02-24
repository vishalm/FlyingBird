import {
  SnakeGameState,
  createInitialState,
  placeFood,
  queueDirection,
  stepGame,
} from '../src/snake/gameLogic';

const runningState = (partial: Partial<SnakeGameState>): SnakeGameState => {
  const base = createInitialState(8, 8, () => 0.5);
  return {
    ...base,
    status: 'running',
    ...partial,
  };
};

describe('snake game logic', () => {
  it('moves one cell in current direction without growth', () => {
    const state = runningState({
      snake: [
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
      direction: 'right',
      food: { x: 7, y: 7 },
    });

    const next = stepGame(state);

    expect(next.snake).toEqual([
      { x: 4, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ]);
    expect(next.score).toBe(0);
    expect(next.status).toBe('running');
  });

  it('grows and increments score when food is eaten', () => {
    const state = runningState({
      snake: [
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
      direction: 'right',
      food: { x: 4, y: 3 },
    });

    const next = stepGame(state, () => 0);

    expect(next.snake).toHaveLength(4);
    expect(next.snake[0]).toEqual({ x: 4, y: 3 });
    expect(next.score).toBe(1);
    expect(next.food).toEqual({ x: 0, y: 0 });
  });

  it('sets game over on wall collision', () => {
    const state = runningState({
      snake: [
        { x: 7, y: 4 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
      ],
      direction: 'right',
      food: { x: 0, y: 0 },
    });

    const next = stepGame(state);

    expect(next.status).toBe('gameOver');
  });

  it('sets game over on self collision', () => {
    const state = runningState({
      snake: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 4, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
      direction: 'up',
      food: { x: 0, y: 0 },
    });

    const next = stepGame(state);

    expect(next.status).toBe('gameOver');
  });

  it('ignores reverse direction input', () => {
    const state = runningState({
      direction: 'right',
      queuedDirection: null,
    });

    const next = queueDirection(state, 'left');

    expect(next.queuedDirection).toBeNull();
  });

  it('places food only on free cells', () => {
    const food = placeFood(
      3,
      3,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      () => 0.99,
    );

    expect(food).toEqual({ x: 2, y: 2 });
  });
});
