/** Swipe-to-steer: maps touch gestures on the canvas to direction changes.
 *  A swipe beyond the threshold queues a direction and re-anchors the gesture
 *  origin, so one continuous drag can steer several turns. */

/** Minimum distance in px a finger must travel before it counts as a swipe. */
const SWIPE_THRESHOLD_PX = 24;

export class TouchController {
  #touchStart = null;

  /** Create a new touch controller bound to the given target and game.
   *  @param {HTMLElement} target — the element that receives touch gestures (the canvas)
   *  @param {import('./game.js').Game} game — the game instance to control */
  constructor(target, game) {
    target.addEventListener('touchstart', (event) => {
      this.#touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });

    // passive: false — swipes must never scroll the page; the gesture is ours.
    target.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if (!this.#touchStart) return;
      const dx = event.touches[0].clientX - this.#touchStart.x;
      const dy = event.touches[0].clientY - this.#touchStart.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) return;

      const direction = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? 'right' : 'left')
        : (dy > 0 ? 'down' : 'up');
      game.handleDirection(direction);
      this.#touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: false });

    target.addEventListener('touchend', () => {
      this.#touchStart = null;
    }, { passive: true });
  }
}
