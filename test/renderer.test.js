import test from 'node:test';
import assert from 'node:assert/strict';
import { Renderer } from '../js/renderer.js';

// ── Test helpers ───────────────────────────────────────────────────────────

/** Set up a minimal document.documentElement mock so getComputedStyle works in Node. */
function mockDocument(themeOverrides = {}) {
  const defaults = {
    '--canvas-bg': '#020617',
    '--grid-color': '#1e293b',
    '--grid-line-width': '1',
    '--food-color': '#ef4444',
    '--food-radius-ratio': '0.3',
    '--snake-head-color': '#38bdf8',
    '--snake-body-color': '#22c55e',
    '--snake-padding': '1',
    '--cell-size': '24',
  };
  const values = { ...defaults, ...themeOverrides };

  globalThis.document = {
    documentElement: {
      style: {},
    },
  };

  // Minimal getComputedStyle that returns CSS variable values
  globalThis.getComputedStyle = () => ({
    getPropertyValue(prop) {
      return values[prop] ?? '';
    },
  });
}

/** Create a minimal canvas-like object for testing. */
function fakeCanvas() {
  return {
    width: 480,
    height: 480,
    getContext() {
      return {
        clearRect() {},
        fillRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        arc() {},
        fill() {},
      };
    },
  };
}

// ── Renderer constructor ──────────────────────────────────────────────────

test('Renderer constructor accepts a canvas without a Game reference', () => {
  mockDocument();
  const canvas = fakeCanvas();
  const renderer = new Renderer(canvas);

  assert.equal(renderer.canvas, canvas);
  assert.equal(renderer.game, undefined);
  assert.equal(renderer.theme.cellSize, 24);
});

test('Renderer reads theme from CSS custom properties', () => {
  mockDocument({ '--snake-head-color': '#ff0000', '--cell-size': '32' });
  const canvas = fakeCanvas();
  const renderer = new Renderer(canvas);

  assert.equal(renderer.theme.snakeHeadColor, '#ff0000');
  assert.equal(renderer.theme.cellSize, 32);
});

// ── Renderer.render(snapshot) ─────────────────────────────────────────────

test('render accepts a plain snapshot object — no Game needed', () => {
  mockDocument();
  const calls = { clearRect: 0, fillRect: 0 };
  const canvas = {
    width: 480,
    height: 480,
    getContext() {
      return {
        clearRect: () => { calls.clearRect++; },
        fillRect: () => { calls.fillRect++; },
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        arc() {},
        fill() {},
      };
    },
  };

  const renderer = new Renderer(canvas);

  const snapshot = {
    width: 20,
    height: 20,
    food: { x: 5, y: 5 },
    segments: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
  };

  // Must not throw — the seam is the snapshot shape, not the Game module
  assert.doesNotThrow(() => renderer.render(snapshot));
  assert.equal(calls.clearRect, 1, 'should clear the canvas once');
  assert.ok(calls.fillRect >= 1, 'should draw at least the background');
});

test('render works with null food', () => {
  mockDocument();
  const canvas = fakeCanvas();
  const renderer = new Renderer(canvas);

  const snapshot = {
    width: 20,
    height: 20,
    food: null,
    segments: [{ x: 10, y: 10 }],
  };

  assert.doesNotThrow(() => renderer.render(snapshot));
});

test('render draws each snake segment', () => {
  mockDocument();
  const fillRectCalls = [];
  const canvas = {
    width: 480,
    height: 480,
    getContext() {
      return {
        clearRect() {},
        fillRect: (...args) => fillRectCalls.push(args),
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        arc() {},
        fill() {},
      };
    },
  };

  const renderer = new Renderer(canvas);

  const snapshot = {
    width: 20,
    height: 20,
    food: null,
    segments: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
  };

  renderer.render(snapshot);

  // 1 background fill + 3 segment fills = 4 fillRect calls
  assert.equal(fillRectCalls.length, 4);
});
