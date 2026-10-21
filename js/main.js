import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3/dist/module.esm.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputController } from './input-controller.js';
import { TouchController } from './touch-controller.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game();
const renderer = new Renderer(canvas);
new InputController(game);
new TouchController(canvas, game);

Alpine.data('jsSnake', () => ({
  score: 0,
  best: 0,
  length: 3,
  paused: false,
  running: true,
  started: false,
  newBest: false,

  /** Status chip text derived from game state. */
  get statusText() {
    if (!this.running && this.started) return 'Game Over';
    if (this.paused) return 'Paused';
    if (this.started) return 'Running';
    return 'Idle';
  },

  /** Status chip CSS class derived from game state. */
  get statusClass() {
    if (!this.running && this.started) return 'status-chip--over';
    if (this.paused) return 'status-chip--paused';
    if (this.started) return 'status-chip--running';
    return '';
  },

  start() {
    game.start();
    this._sync();
  },

  restart() {
    game.reset();
    this._sync();
  },

  togglePause() {
    game.togglePause();
    this._sync();
  },

  /** Read the game snapshot and update reactive properties.
   *  @param {{ score: number, best: number, newBest: boolean, paused: boolean, running: boolean, started: boolean, segments: {x:number,y:number}[], dying: boolean, deathTick: number }|undefined} snapshot */
  _sync(snapshot) {
    const snap = snapshot ?? game.getSnapshot();
    this.score = snap.score;
    this.best = snap.best;
    this.length = snap.segments.length;
    this.paused = snap.paused;
    this.running = snap.running;
    this.started = snap.started;
    this.newBest = snap.started && !snap.running && snap.newBest;
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
