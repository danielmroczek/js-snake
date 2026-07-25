/** A rectangular game board that tracks food placement and provides coordinate utilities. */
export class Board {
  /** Create a new board.
   *  @param {number} [width=20] — number of columns
   *  @param {number} [height=20] — number of rows */
  constructor(width = 20, height = 20) {
    this.width = width;
    this.height = height;
    this.food = null;
  }

  /** Clear the board state. Removes any placed food. */
  reset() {
    this.food = null;
  }

  /** Check whether a position is inside the board boundaries (no wrapping).
   *  @param {number} x
   *  @param {number} y
   *  @returns {boolean} */
  isInside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /** Wrap a position so it falls within board bounds using modular arithmetic.
   *  @param {number} x — may be negative or out of range
   *  @param {number} y — may be negative or out of range
   *  @returns {{ x: number, y: number }} the wrapped position */
  wrapPosition(x, y) {
    return {
      x: ((x % this.width) + this.width) % this.width,
      y: ((y % this.height) + this.height) % this.height,
    };
  }

  /** Find a random cell not occupied by the snake.
   *  Scans the entire board and picks uniformly from empty cells.
   *  @param {{ segments: {x:number,y:number}[] }} snake — the snake to avoid
   *  @returns {{ x: number, y: number }|null} an empty cell, or null if the board is full */
  getRandomEmptyCell(snake) {
    const occupied = new Set(snake.segments.map(({ x, y }) => `${x},${y}`));
    const cells = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (!occupied.has(`${x},${y}`)) {
          cells.push({ x, y });
        }
      }
    }

    if (cells.length === 0) {
      return null;
    }

    return cells[Math.floor(Math.random() * cells.length)];
  }

  /** Check whether food is currently placed at the given position.
   *  @param {number} x
   *  @param {number} y
   *  @returns {boolean} */
  isFoodAt(x, y) {
    return this.food !== null && this.food.x === x && this.food.y === y;
  }

  /** Place food on a random empty cell (avoiding the snake's body).
   *  @param {{ segments: {x:number,y:number}[] }} snake — the snake to avoid
   *  @returns {{ x: number, y: number }|null} the placed food position, or null if no space */
  placeFood(snake) {
    this.food = this.getRandomEmptyCell(snake);
    return this.food;
  }
}
