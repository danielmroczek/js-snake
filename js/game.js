import { Board } from './board.js';
import { Snake } from './snake.js';

export class Game {
  #board;
  #snake;
  #running;
  #paused;
  #dying;
  #deathTick;
  #score;
  #tickMs;
  #lastTimestamp = null;

  /** Create a new game on a 20×20 board with a 120 ms tick interval. */
  constructor() {
    this.#board = new Board(20, 20);
    this.#tickMs = 120;
    this.reset();
  }

  /** Reset the game to its initial state: new snake, cleared board, score 0. */
  reset() {
    this.#snake = new Snake(10, 10);
    this.#board.reset();
    this.#board.placeFood(this.#snake);
    this.#score = 0;
    this.#running = true;
    this.#paused = false;
    this.#dying = false;
    this.#deathTick = 0;
    this.#lastTimestamp = null;
  }

  /** Queue a direction change for the snake. Ignored when the game is over, paused, or dying.
   *  @param {('up'|'down'|'left'|'right')} direction */
  handleDirection(direction) {
    if (!this.#running || this.#paused || this.#dying) {
      return;
    }

    this.#snake.setDirection(direction);
  }

  /** Toggle the paused state. Ignored when the game is over or dying. */
  togglePause() {
    if (!this.#running || this.#dying) {
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

    const elapsed = timestamp - this.#lastTimestamp;
    if (elapsed >= this.#tickMs) {
      if (this.#dying) {
        this.#deathTick++;
        // +2 extra ticks after all segments are grayed for the pause before game-over
        if (this.#deathTick >= this.#snake.segments.length + 2) {
          this.#dying = false;
          this.#running = false;
        }
        this.#lastTimestamp = timestamp;
      } else if (!this.#paused) {
        this.step();
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
      paused: this.#paused,
      dying: this.#dying,
      deathTick: this.#deathTick,
      score: this.#score,
    };
  }

  /** Advance the game by one tick: move the snake, check collisions, handle food.
   *  No-op when the game is over, paused, or dying. */
  step() {
    if (!this.#running || this.#paused || this.#dying) {
      return;
    }

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
