# JS-Snake

A classic Snake game built with vanilla JavaScript, HTML5 Canvas, and Alpine.js. No build tools, no frameworks — just the browser.

## Features

- **Zero build step** — open `index.html` in a browser and play
- **Stat rail + play column layout** — score/best/length cards beside the board, status chip always visible
- **Start screen (idle state)** — the snake doesn't run before the first input; press Play or any arrow key to start
- **Best score** — persisted in `localStorage`, highlighted when a round sets a new record
- **Touch controls** — swipe anywhere on the canvas to steer (mobile)
- **Wrap-around board** — the snake wraps at edges instead of dying on walls
- **Queued direction input** — up to 10 pending directions are buffered, so rapid key presses are never lost
- **Death animation** — segments turn gray one by one before the game-over overlay appears
- **Step transitions** — UI state changes use 90ms `steps(2)` motion, no easing curves
- **CSS-driven theme** — all colors, sizes, and ratios are CSS custom properties; restyle the game without touching JS
- **Tested** — unit tests using Node.js built-in test runner

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-user>/js-snake.git
   cd js-snake
   ```

2. Serve the files with any static server (required for ES modules):
   ```bash
   npx serve .
   ```

3. Open the printed URL in your browser and play.

> [!NOTE]
> Opening `index.html` directly via `file://` won't work because the code uses ES module imports, which require an HTTP server.

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Change direction (also starts an idle game) |
| Space | Start an idle game / Pause / Resume / Play again after game over |
| R | Restart |
| Swipe (mobile) | Change direction |

## Architecture

```
js/
  main.js             Entry point — wires Game, Renderer, InputController, TouchController, and Alpine
  game.js             Game loop, tick timing, collision logic, death animation
  snake.js            Snake state: segments, direction queue, growth, self-collision
  board.js            Grid dimensions, food placement, coordinate wrapping
  renderer.js         Canvas drawing — grid, food, snake (reads theme from CSS)
  input-controller.js Keyboard → game action mapping
  touch-controller.js Canvas swipe gestures → game.handleDirection()
```

The `Game` class produces a plain-object **snapshot** each frame. The `Renderer` consumes that snapshot — it never imports `Game`, keeping the rendering seam narrow and testable with a stub object.

The `Game` boots into an **idle state** (`started: false`): `update()` keeps the clock primed but never steps until `start()` fires (Play button, first arrow/WASD key, first swipe, or the pause toggle). The `TouchController` in `js/touch-controller.js` translates canvas swipes (24px threshold, with `preventDefault()` on `touchmove` to stop page scrolling) into `handleDirection()` calls.

The design record for the stat-rail surface lives in [DESIGN.md](DESIGN.md).

## Theming

All visual properties are defined as CSS custom properties in `styles.css`:

```css
:root {
  --canvas-bg: #020617;
  --snake-head-color: #38bdf8;
  --snake-body-color: #22c55e;
  --food-color: #ef4444;
  --cell-size: 24;
  /* ... */
}
```

Change any value to instantly restyle the game — no JavaScript edits needed.

## Testing

Tests use the Node.js built-in test runner (`node:test`):

```bash
npm test
```

## Tech Stack

- **JavaScript** — ES modules, private class fields, no transpilation
- **HTML5 Canvas** — 2D rendering at 24 px cell size
- **Alpine.js 3** — lightweight reactivity for score, pause, and game-over UI
- **Pico CSS** — minimal styling for the page chrome
- **Node.js test runner** — zero-dependency unit testing
