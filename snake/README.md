# Snake

Small, dependency-free Snake game built as a static web app.

## Run

1. From `I:\MDATOS2.0`, start a static server with `python -m http.server 8000`.
2. Open `http://localhost:8000`.

## Files

- `index.html`: game shell
- `styles.css`: minimal styling
- `src/game.js`: deterministic game logic
- `src/app.js`: rendering and input wiring
- `tests/snake-logic.html`: lightweight browser-based logic checks

## Manual checks

- Start the game, move with arrow keys and `W`, `A`, `S`, `D`.
- Confirm the snake grows and score increments after eating food.
- Confirm pause and resume work with the button and Space key.
- Confirm wall collisions and self-collisions trigger game over.
- Confirm Restart resets score, snake length, and food placement.
