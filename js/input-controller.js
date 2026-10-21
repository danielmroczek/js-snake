/** Keyboard input controller that maps key presses to game actions.
 *  Arrow keys / WASD → direction (starts an idle game), Space → pause, R → restart. */
export class InputController {
  /** Create a new input controller bound to the given game.
   *  @param {import('./game.js').Game} game — the game instance to control */
  constructor(game) {
    this.game = game;

    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        this.game.togglePause();
        return;
      }

      const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = map[event.key];
      if (direction) {
        event.preventDefault();
        this.game.handleDirection(direction);
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        this.game.reset();
      }
    });
  }
}
