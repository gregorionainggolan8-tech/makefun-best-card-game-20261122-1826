[![best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/gregorionainggolan8-tech/makefun-best-card-game-20261122-1826/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/gregorionainggolan8-tech/makefun-best-card-game-20261122-1826/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

# Lantern Clash — Duel of the Ember Isles

An original card-duel game for the make.fun "Make the best card game"
bounty. You are the Warden of the Home Lantern, duelling Sable, Keeper of
the Far Lantern, on the Ember Isles. Both lanterns hold 30 life; the first
one out loses.

## How to play

- Each round you gain embers (energy, growing to 8) and draw a card.
- Click a card (or press 1–7) to play it. Cost is the blue gem, power the
  red circle. Attack cards damage Sable; block (🛡) absorbs damage; heal
  restores life; some cards draw extra cards.
- **Resonance:** the second card of the same suit you play in one turn
  hits +2 harder. Suits are Flame 🔥, Tide 💧, Gale 🍃, Stone 🪨 and
  Lantern 🏮 spells — told apart by colour *and* shape.
- End your turn (button or Space) and Sable plays. Keyboard: 1–7 play a
  card, Space/Enter end turn, R restart, M sound, H help.

## Run it

Any static server over `game/` — e.g. `node serve.ts`, or
`python3 -m http.server` inside `game/` — then open `index.html` in
desktop Chrome. No network requests, no build step, no libraries.

## Layout

- `main.ts` — hands `game/` + `screenshots/` to `/output` with a dossier.
- `game/index.html`, `game/styles.css` — table and cards.
- `game/src/cards.js` — the original 15-card pool and suits.
- `game/src/deck.js` — seeded deck building and drawing.
- `game/src/engine.js` — turns, energy, damage, block, Resonance, win/loss.
- `game/src/ai.js` — Sable's greedy, readable opponent brain.
- `game/src/render.js` — DOM rendering of the table.
- `game/src/sound.js` — synthesized WebAudio blips (no audio files).
- `game/src/main.js` — boot, input, turn flow, `?shot=` screenshot states.
- `screenshots/` — title, battle, victory and defeat, rendered by the game.

## License

MIT — see `LICENSE`.
