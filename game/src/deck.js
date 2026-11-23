// Lantern Clash — deck building and drawing. A deck is two copies of every
// card definition (30 cards), shuffled with a seeded RNG so a game can be
// replayed deterministically from its seed.
import { CARD_DEFS } from './cards.js';

// mulberry32: small deterministic PRNG, seeded per game.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDeck(rng) {
  const deck = [];
  for (const def of CARD_DEFS) {
    deck.push({ ...def, uid: def.id + '-a' });
    deck.push({ ...def, uid: def.id + '-b' });
  }
  // Fisher–Yates shuffle with the game's RNG.
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(deck, hand, count, limit) {
  const drawn = [];
  while (count > 0 && deck.length > 0 && hand.length < limit) {
    const card = deck.pop();
    hand.push(card);
    drawn.push(card);
    count--;
  }
  return drawn;
}
