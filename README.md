# JS-Snake

A classic Snake game built with vanilla JavaScript, HTML5 Canvas, and Alpine.js. No build tools, no frameworks — just the browser.

## Features

- **Zero build step** — open `index.html` in a browser and play
- **Wrap-around board** — the snake wraps at edges instead of dying on walls
- **Queued direction input** — up to 10 pending directions are buffered, so rapid key presses are never lost
- **Death animation** — segments turn gray one by one before the game-over overlay fades in
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
| Arrow keys / WASD | Change direction |
| Space | Pause / Resume |
| R | Restart |

## Architecture

```
js/
  main.js             Entry point — wires Game, Renderer, InputController, and Alpine
  game.js             Game loop, tick timing, collision logic, death animation
  snake.js            Snake state: segments, direction queue, growth, self-collision
  board.js            Grid dimensions, food placement, coordinate wrapping
  renderer.js         Canvas drawing — grid, food, snake (reads theme from CSS)
  input-controller.js Keyboard → game action mapping
```

The `Game` class produces a plain-object **snapshot** each frame. The `Renderer` consumes that snapshot — it never imports `Game`, keeping the rendering seam narrow and testable with a stub object.

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
