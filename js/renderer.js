/** Canvas-based renderer that draws the game board, food, and snake each frame.
 *  Depends on a snapshot data shape, not the Game module — this keeps the seam narrow
 *  and makes the renderer testable with a plain object.
 *
 *  All visual theme values (colors, sizes, ratios) are read from CSS custom properties
 *  on :root, so the theme can be changed purely in CSS without touching JS.
 *
 *  Snapshot shape consumed: { width, height, food, segments, dying, deathTick }
 *  where food is { x, y } | null and segments is { x, y }[]. */
export class Renderer {
  /** Create a new renderer bound to the given canvas.
   *  Reads theme values from CSS custom properties at construction time.
   *  @param {HTMLCanvasElement} canvas — the <canvas> element to draw on */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    const style = getComputedStyle(document.documentElement);
    const rootFontSize = parseFloat(style.fontSize) || 16;
    this.theme = {
      canvasBg:        style.getPropertyValue('--canvas-bg').trim(),
      gridColor:       style.getPropertyValue('--grid-color').trim(),
      gridLineWidth:   this.#readCssLength(style, '--grid-line-width', 1, rootFontSize),
      foodColor:       style.getPropertyValue('--food-color').trim(),
      foodRadiusRatio: parseFloat(style.getPropertyValue('--food-radius-ratio')) || 0.3,
      snakeHeadColor:  style.getPropertyValue('--snake-head-color').trim(),
      snakeBodyColor:  style.getPropertyValue('--snake-body-color').trim(),
      snakePadding:    this.#readCssLength(style, '--snake-padding', 1, rootFontSize),
      cellSize:        this.#readCssLength(style, '--cell-size', 24, rootFontSize),
    };
  }

  /** Render a game frame from the given snapshot.
   *  @param {{ width: number, height: number, food: {x:number,y:number}|null, segments: {x:number,y:number}[], dying: boolean, deathTick: number }} snapshot */
  render(snapshot) {
    const { width, height, food, segments, running, dying, deathTick } = snapshot;
    const { cellSize } = this.theme;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.theme.canvasBg;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.#drawGrid(width, height);
    this.#drawFood(food);
    this.#drawSnake(segments, running, dying, deathTick);
  }

  #drawGrid(width, height) {
    const { cellSize, gridColor, gridLineWidth } = this.theme;

    this.context.strokeStyle = gridColor;
    this.context.lineWidth = gridLineWidth;

    for (let x = 0; x <= width; x += 1) {
      this.context.beginPath();
      this.context.moveTo(x * cellSize, 0);
      this.context.lineTo(x * cellSize, height * cellSize);
      this.context.stroke();
    }

    for (let y = 0; y <= height; y += 1) {
      this.context.beginPath();
      this.context.moveTo(0, y * cellSize);
      this.context.lineTo(width * cellSize, y * cellSize);
      this.context.stroke();
    }
  }

  #drawFood(food) {
    if (!food) {
      return;
    }

    const { cellSize, foodColor, foodRadiusRatio } = this.theme;
    const { x, y } = food;

    this.context.fillStyle = foodColor;
    this.context.beginPath();
    this.context.arc(
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize / 2,
      cellSize * foodRadiusRatio,
      0,
      Math.PI * 2,
    );
    this.context.fill();
  }

  #drawSnake(segments, running = true, dying = false, deathTick = 0) {
    const { cellSize, snakeHeadColor, snakeBodyColor, snakePadding } = this.theme;

    segments.forEach((segment, index) => {
      let color = index === 0 ? snakeHeadColor : snakeBodyColor;

      if ((!running || dying) && index < deathTick) {
        color = this.#grayscale(color);
      }

      this.context.fillStyle = color;
      this.context.fillRect(
        segment.x * cellSize + snakePadding,
        segment.y * cellSize + snakePadding,
        cellSize - snakePadding * 2,
        cellSize - snakePadding * 2,
      );
    });
  }

  #readCssLength(style, propertyName, fallback, rootFontSize) {
    const rawValue = style.getPropertyValue(propertyName).trim();
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = parseFloat(rawValue);
    if (Number.isNaN(parsedValue)) {
      return fallback;
    }

    const unit = rawValue.replace(`${parsedValue}`, '').trim();
    switch (unit) {
      case 'rem':
      case 'em':
        return parsedValue * rootFontSize;
      case 'px':
      default:
        return parsedValue;
    }
  }

  /** Convert a hex color to its luminance-based grayscale equivalent.
   *  Preserves the perceived brightness of the original color, so a blue head
   *  becomes a lighter gray and a green body a darker gray.
   *  @param {string} hex — a hex color like '#38bdf8'
   *  @returns {string} the grayscale hex color */
  #grayscale(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const gray = lum.toString(16).padStart(2, '0');
    return `#${gray}${gray}${gray}`;
  }
}
