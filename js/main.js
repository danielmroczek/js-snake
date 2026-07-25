import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3/dist/module.esm.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputController } from './input-controller.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game();
const renderer = new Renderer(canvas);
new InputController(game);

Alpine.data('jsSnake', () => ({
  score: 0,
  paused: false,
  running: true,

  restart() {
    game.reset();
    this._sync();
  },

  togglePause() {
    game.togglePause();
    this._sync();
  },

  /** Read the game snapshot and update reactive properties.
   *  @param {{ score: number, paused: boolean, running: number }|undefined} snapshot */
  _sync(snapshot) {
    const snap = snapshot ?? game.getSnapshot();
    this.score = snap.score;
    this.paused = snap.paused;
    this.running = snap.running;
  },

  init() {
    this._sync();

    /** The main animation loop: update the game, render the frame, sync Alpine state, and schedule the next frame.
     *  @param {number} timestamp — the DOMHighResTimeStamp from requestAnimationFrame */
    const loop = (timestamp) => {
      game.update(timestamp);
      const snapshot = game.getSnapshot();
      renderer.render(snapshot);
      this._sync(snapshot);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  },
}));

Alpine.start();
