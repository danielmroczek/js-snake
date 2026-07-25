import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../js/game.js';
import { Snake } from '../js/snake.js';
import { Board } from '../js/board.js';

// ── Test helpers ───────────────────────────────────────────────────────────

/** Drive the game through its public interface to walk the snake in a direction. */
function walk(game, direction, steps = 1) {
  game.handleDirection(direction);
  for (let i = 0; i < steps; i++) game.step();
}

// ── Snake.advanceDirection / peekNextPosition ──────────────────────────────

test('peekNextPosition is pure — same result on repeated calls', () => {
  const snake = new Snake(10, 10, 'right');
  const first = snake.peekNextPosition();
  const second = snake.peekNextPosition();
  assert.deepEqual(first, second);
  assert.deepEqual(first, { x: 11, y: 10 });
});

test('peekNextPosition returns raw position without wrapping', () => {
  const snake = new Snake(0, 0, 'left');
  const result = snake.peekNextPosition();
  assert.deepEqual(result, { x: -1, y: 0 });
});

test('advanceDirection consumes the first queued direction', () => {
  const snake = new Snake(10, 10, 'right');
  snake.setDirection('down');
  snake.setDirection('left');
  snake.advanceDirection();
  assert.equal(snake.direction, 'down');
  assert.deepEqual(snake.pendingDirections, ['left']);
});

test('advanceDirection keeps current direction when queue is empty', () => {
  const snake = new Snake(10, 10, 'right');
  snake.advanceDirection();
  assert.equal(snake.direction, 'right');
});

// ── Game.getSnapshot() ────────────────────────────────────────────────────

test('getSnapshot returns complete game state', () => {
  const game = new Game();
  const snap = game.getSnapshot();
  assert.equal(snap.width, 20);
  assert.equal(snap.height, 20);
  assert.ok(Array.isArray(snap.segments));
  assert.equal(snap.running, true);
  assert.equal(snap.paused, false);
  assert.equal(snap.score, 0);
  assert.ok(snap.food !== null);
});

test('getSnapshot returns defensive copies of segments and food', () => {
  const game = new Game();
  const snap = game.getSnapshot();

  // Mutating the snapshot must not affect the game
  const originalHead = { ...snap.segments[0] };
  snap.segments[0].x = 999;
  const snap2 = game.getSnapshot();
  assert.deepEqual(snap2.segments[0], originalHead);
});

// ── Game.step() — movement ────────────────────────────────────────────────

test('step advances the snake', () => {
  const game = new Game();
  const before = game.getSnapshot().segments[0].x;
  game.step();
  const after = game.getSnapshot().segments[0].x;
  assert.notEqual(after, before);
});

test('step wraps the snake at board edges', () => {
  const game = new Game();
  // Snake starts at (10,10) heading right with body at (9,10),(8,10).
  // Go down first to avoid the body, then left to the edge, then wrap.
  walk(game, 'down', 1);   // head at (10,11)
  walk(game, 'left', 11);  // head at (10-11+1, 11) = wraps from 0→19
  const snap = game.getSnapshot();
  assert.equal(snap.segments[0].x, 19);
});

// ── Game.step() — eating food ─────────────────────────────────────────────

test('snake grows when it eats food', () => {
  const game = new Game();

  // Walk a few steps to let the initial growth (1→5 segments) finish
  for (let i = 0; i < 5; i++) game.step();
  const initialLength = game.getSnapshot().segments.length;

  // Zigzag across the board to cover more ground and find the food.
  // Alternate: go right across a row, step down, go left across the next row, step down, etc.
  let ate = false;
  for (let row = 0; row < 20 && !ate; row++) {
    const dir = row % 2 === 0 ? 'right' : 'left';
    for (let s = 0; s < 20 && !ate; s++) {
      game.handleDirection(dir);
      game.step();
      if (game.getSnapshot().score > 0) ate = true;
    }
    if (!ate && row < 19) {
      game.handleDirection('down');
      game.step();
      if (game.getSnapshot().score > 0) ate = true;
    }
  }

  assert.ok(ate, 'snake should have eaten food by scanning the board');
  const snap = game.getSnapshot();
  assert.equal(snap.segments.length, initialLength + 1);
});

// ── Game.step() — self-collision ───────────────────────────────────────────

test('game stops when snake hits itself', () => {
  const game = new Game();

  // Walk the snake in a pattern that covers the board and forces collision.
  // Alternate between zigzag rows and shrinking spirals.
  // The snake must eventually collide because it grows with each food eaten
  // and the board has only 400 cells.
  let steps = 0;
  const maxSteps = 2000;

  while (game.getSnapshot().running && !game.getSnapshot().dying && steps < maxSteps) {
    // Zigzag one full pass across the board
    for (let row = 0; row < 20 && game.getSnapshot().running && !game.getSnapshot().dying; row++) {
      const dir = row % 2 === 0 ? 'right' : 'left';
      for (let s = 0; s < 20 && game.getSnapshot().running && !game.getSnapshot().dying; s++) {
        game.handleDirection(dir);
        game.step();
        steps++;
      }
      if (game.getSnapshot().running && !game.getSnapshot().dying && row < 19) {
        game.handleDirection('down');
        game.step();
        steps++;
      }
    }

    // Shrinking spiral
    for (let size = 10; size >= 1 && game.getSnapshot().running && !game.getSnapshot().dying; size--) {
      walk(game, 'down', size);
      steps += size;
      walk(game, 'left', size);
      steps += size;
      walk(game, 'up', size);
      steps += size;
      walk(game, 'right', size);
      steps += size;
    }
  }

  // The snake should now be in dying state
  assert.equal(game.getSnapshot().dying, true);

  // Drive through the death animation ticks until the game ends
  let t = 0;
  while (game.getSnapshot().running && t < 50) {
    game.update(t * 120);
    t++;
  }

  assert.equal(game.getSnapshot().running, false);
});

// ── Game.handleDirection() ────────────────────────────────────────────────

test('queued directions are applied one step at a time', () => {
  const game = new Game();
  game.handleDirection('down');
  game.step();

  const snap1 = game.getSnapshot();
  assert.equal(snap1.segments[0].x, 10);
  assert.equal(snap1.segments[0].y, 11);

  game.handleDirection('left');
  game.step();

  const snap2 = game.getSnapshot();
  assert.equal(snap2.segments[0].x, 9);
  assert.equal(snap2.segments[0].y, 11);
});

test('queued directions are preserved FIFO and consumed one at a time', () => {
  const game = new Game();
  game.handleDirection('down');
  game.handleDirection('left');
  game.handleDirection('down');

  game.step();
  let snap = game.getSnapshot();
  assert.equal(snap.segments[0].x, 10);
  assert.equal(snap.segments[0].y, 11);

  game.step();
  snap = game.getSnapshot();
  assert.equal(snap.segments[0].x, 9);
  assert.equal(snap.segments[0].y, 11);

  game.step();
  snap = game.getSnapshot();
  assert.equal(snap.segments[0].x, 9);
  assert.equal(snap.segments[0].y, 12);
});

// ── Game.togglePause() ────────────────────────────────────────────────────

test('togglePause pauses and unpauses the game', () => {
  const game = new Game();
  game.togglePause();
  assert.equal(game.getSnapshot().paused, true);

  game.togglePause();
  assert.equal(game.getSnapshot().paused, false);
});

test('step does nothing when paused', () => {
  const game = new Game();
  game.togglePause();
  const before = game.getSnapshot().segments[0];
  game.step();
  const after = game.getSnapshot().segments[0];
  assert.deepEqual(before, after);
});

// ── Game.reset() ──────────────────────────────────────────────────────────

test('reset restores initial state', () => {
  const game = new Game();
  walk(game, 'right', 5);
  game.reset();

  const snap = game.getSnapshot();
  assert.equal(snap.score, 0);
  assert.equal(snap.running, true);
  assert.equal(snap.paused, false);
});

// ── Game.update(timestamp) ────────────────────────────────────────────────

test('game.update steps when enough time has elapsed', () => {
  const game = new Game();
  const before = game.getSnapshot().segments[0].x;
  game.update(0);
  game.update(120); // elapsed = 120ms = tickMs → should step
  const after = game.getSnapshot().segments[0].x;
  assert.notEqual(after, before);
});

test('game.update does not step when not enough time has elapsed', () => {
  const game = new Game();
  const before = game.getSnapshot().segments[0].x;
  game.update(0);
  game.update(119); // elapsed < tickMs → no step
  const after = game.getSnapshot().segments[0].x;
  assert.equal(after, before);
});
