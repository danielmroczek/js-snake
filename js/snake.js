const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const DELTA = {
  right: { dx: 1, dy: 0 },
  left:  { dx: -1, dy: 0 },
  up:    { dx: 0, dy: -1 },
  down:  { dx: 0, dy: 1 },
};

/** A snake that moves on a 2D grid, with a queued direction system for responsive input. */
export class Snake {
  #growthRemaining;

  /** Create a new snake.
   *  @param {number} [startX=10] — initial head x position
   *  @param {number} [startY=10] — initial head y position
   *  @param {('up'|'down'|'left'|'right')} [initialDirection='right'] — starting direction
   *  @param {number} [initialLength=5] — starting length; the snake begins as a single
   *    head and grows this many segments over the first ticks (as if it ate apples). */
  constructor(startX = 10, startY = 10, initialDirection = 'right', initialLength = 5) {
    this.direction = initialDirection;
    this.nextDirection = initialDirection;
    this.pendingDirections = [];
    this.segments = [
      { x: startX, y: startY },
    ];
    this.#growthRemaining = Math.max(0, initialLength - 1);
  }

  /** Return the head segment (first element of the segments array).
   *  @returns {{ x: number, y: number }} */
  getHead() {
    return this.segments[0];
  }

  /** Consume the next queued direction and apply it as the current direction. */
  advanceDirection() {
    const next = this.pendingDirections.shift() ?? this.nextDirection;
    this.direction = next;
    this.nextDirection = next;
  }

  /** Pure — compute the raw next head cell from the current direction. No side-effects. Wrapping is the caller's responsibility. */
  peekNextPosition() {
    const { x, y } = this.getHead();
    const { dx, dy } = DELTA[this.direction];
    return { x: x + dx, y: y + dy };
  }

  /** Queue a direction change. Opposite directions are rejected to prevent 180° turns.
   *  Up to 10 pending directions are kept (FIFO), consumed one per step.
   *  @param {('up'|'down'|'left'|'right')} direction */
  setDirection(direction) {
    const nextDirection = this.pendingDirections[0] ?? this.nextDirection;
    if (OPPOSITE[direction] === nextDirection) {
      return;
    }

    const lastDirection = this.pendingDirections[this.pendingDirections.length - 1] ?? this.nextDirection;
    if (OPPOSITE[direction] !== lastDirection && this.pendingDirections.length < 10) {
      this.pendingDirections.push(direction);
    }
  }

  /** Move the snake: prepend the next head position, and remove the tail unless the snake
   *  is growing (from eating food or from initial growth).
   *  @param {boolean} ateFood — if true, the tail is kept (snake grows by one segment)
   *  @param {{ x: number, y: number }} nextHead — the new head position */
  move(ateFood, nextHead) {
    this.segments.unshift(nextHead);
    if (ateFood) {
      // Eating adds one segment of growth on top of any pending initial growth.
      this.#growthRemaining += 1;
      return;
    }
    if (this.#growthRemaining > 0) {
      this.#growthRemaining -= 1;
    } else {
      this.segments.pop();
    }
  }

  /** Check whether the next head position collides with the snake's own body.
   *  When the snake is growing (from food or initial growth), the tail stays in place
   *  so the entire body is checked; otherwise the tail is about to move and is excluded.
   *  @param {{ x: number, y: number }} nextHead — the candidate head position
   *  @param {boolean} [ateFood=false] — whether food was eaten this tick
   *  @returns {boolean} */
  collidesWithSelf(nextHead, ateFood = false) {
    const growing = ateFood || this.#growthRemaining > 0;
    const body = growing ? this.segments : this.segments.slice(0, -1);
    return body.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);
  }
}
