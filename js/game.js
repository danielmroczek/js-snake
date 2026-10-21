import { Board } from './board.js';
import { Snake } from './snake.js';

export class Game {
  #board;
  #snake;
  #running;
  #paused;
  #dying;
  #started;
  #deathTick;
  #score;
  #best;
  #tickMs;
  #newBest = false;
  #lastTimestamp = null;

  /** Create a new game on a 20×20 board with a 120 ms tick interval. */
  constructor() {
    this.#board = new Board(20, 20);
    this.#tickMs = 120;
    try {
      this.#best = Number(localStorage.getItem('js-snake-best')) || 0;
    } catch {
      this.#best = 0;
    }
    this.reset();
  }

  /** Reset the game to its initial state: new snake, cleared board, score 0.
   *  The game enters the idle (not started) state until start() is called. */
  reset() {
    this.#snake = new Snake(10, 10);
    this.#board.reset();
    this.#board.placeFood(this.#snake);
    this.#score = 0;
    this.#running = true;
    this.#paused = false;
    this.#dying = false;
    this.#started = false;
    this.#deathTick = 0;
    this.#newBest = false;
    this.#lastTimestamp = null;
  }

  /** Leave the idle state and begin play. No-op when already started. */
  start() {
    this.#started = true;
    this.#lastTimestamp = null;
  }

  /** Queue a direction change for the snake. Ignored when the game is over, paused, or dying.
   *  @param {('up'|'down'|'left'|'right')} direction */
  handleDirection(direction) {
    if (!this.#running || this.#paused || this.#dying) {
      return;
    }

    if (!this.#started) {
      this.start();
    }

    this.#snake.setDirection(direction);
  }

  /** Toggle the paused state. Ignored while dying or not yet started.
   *  On a finished round (Space after game over) this restarts straight into play — no idle screen. */
  togglePause() {
    if (this.#dying) {
      return;
    }

    if (!this.#running) {
      this.reset();
      this.start();
      return;
    }

    if (!this.#started) {
      // Space on the idle screen starts the game immediately.
      this.start();
      return;
    }

    this.#paused = !this.#paused;
  }

  /** Drive the game clock. Call once per animation frame with the rAF timestamp.
   *  @param {number} timestamp — the DOMHighResTimeStamp from requestAnimationFrame */
  update(timestamp) {
    if (this.#lastTimestamp === null) {
      this.#lastTimestamp = timestamp;
      return;
    }

    if (!this.#started) {
      // Idle: clock primed, but no stepping until the player starts.
      this.#lastTimestamp = timestamp;
      return;
    }

    if (!this.#running) {
      // Round is over: freeze the world — only the clock stays primed.
      this.#lastTimestamp = timestamp;
      return;
    }

    const elapsed = timestamp - this.#lastTimestamp;
    if (elapsed >= this.#tickMs) {
      if (this.#dying) {
        this.#deathTick++;
        // +2 extra ticks after all segments are grayed for the pause before game-over
        if (this.#deathTick >= this.#snake.segments.length + 2) {
          this.#dying = false;
          this.#running = false;
          this.#commitBest();
        }
        this.#lastTimestamp = timestamp;
      } else if (!this.#paused) {
        this.#tick();
        this.#lastTimestamp = timestamp;
      }
    }
  }

  /** Return a plain snapshot of the current game state.
   *  @returns {{ width: number, height: number, food: {x:number,y:number}|null, segments: {x:number,y:number}[], running: boolean, paused: boolean, dying: boolean, deathTick: number, score: number }} */
  getSnapshot() {
    return {
      width: this.#board.width,
      height: this.#board.height,
      food: this.#board.food ? { ...this.#board.food } : null,
      segments: this.#snake.segments.map((s) => ({ ...s })),
      running: this.#running,
      started: this.#started,
      paused: this.#paused,
      dying: this.#dying,
      deathTick: this.#deathTick,
      score: this.#score,
      best: this.#best,
      newBest: this.#newBest,
    };
  }

  /** Persist a new best score after a finished round.
   *  @returns {boolean} true when the round set a new best. */
  #commitBest() {
    if (this.#score > this.#best) {
      this.#best = this.#score;
      try {
        localStorage.setItem('js-snake-best', String(this.#best));
      } catch {
        /* storage unavailable — keep the in-memory best */
      }
      this.#newBest = true;
      return true;
    }
    return false;
  }

  /** Whether the most recently finished round set a new best. */
  get newBest() {
    return this.#newBest;
  }

  /** Advance the game by one tick: move the snake, check collisions, handle food.
   *  No-op when the game is over, paused, or dying. Direct calls (tests,
   *  keyboard-driven play) leave the idle state; the rAF clock (update) does not. */
  step() {
    if (!this.#running || this.#paused || this.#dying) {
      return;
    }

    if (!this.#started) {
      this.start();
    }

    this.#tick();
  }

  /** Move the snake one cell — the shared body used by both step() and #tick().
   *  Assumes all guards (running, paused, dying, idle) have already been applied. */
  #tick() {
    this.#snake.advanceDirection();
    const raw = this.#snake.peekNextPosition();
    const nextHead = this.#board.wrapPosition(raw.x, raw.y);
    const ateFood = this.#board.isFoodAt(nextHead.x, nextHead.y);
    const hitSelf = this.#snake.collidesWithSelf(nextHead, ateFood);

    if (hitSelf) {
      this.#dying = true;
      this.#deathTick = 0;
      return;
    }

    this.#snake.move(ateFood, nextHead);

    if (ateFood) {
      this.#score += 1;
      this.#board.placeFood(this.#snake);
    }
  }
}
