// Lantern Clash — the card pool. Every card is an original design:
// four suits of the Ember Isles (Flame, Tide, Gale, Stone) plus Lantern spells.
// A card is { id, name, suit, cost, power, kind, text, glyph }.
// kind: 'attack' deals power damage; 'guard' deals power damage and gains block;
// 'heal' restores life; 'surge' deals power damage; 'draw' draws cards.
export const SUITS = {
  flame:   { label: 'Flame',   glyph: '🔥', color: '#c0392b' },
  tide:    { label: 'Tide',    glyph: '💧', color: '#2471a3' },
  gale:    { label: 'Gale',    glyph: '🍃', color: '#1e8449' },
  stone:   { label: 'Stone',   glyph: '🪨', color: '#7d6608' },
  lantern: { label: 'Lantern', glyph: '🏮', color: '#b7950b' },
};

export const CARD_DEFS = [
  { id: 'cinder-imp',      name: 'Cinder Imp',      suit: 'flame', cost: 1, power: 2, kind: 'attack', text: 'Deal 2 damage.' },
  { id: 'ember-fox',       name: 'Ember Fox',       suit: 'flame', cost: 2, power: 4, kind: 'attack', text: 'Deal 4 damage.' },
  { id: 'pyre-drake',      name: 'Pyre Drake',      suit: 'flame', cost: 3, power: 6, kind: 'attack', text: 'Deal 6 damage.' },
  { id: 'mist-wisp',       name: 'Mist Wisp',       suit: 'tide',  cost: 1, power: 2, kind: 'attack', text: 'Deal 2 damage.' },
  { id: 'tide-serpent',    name: 'Tide Serpent',    suit: 'tide',  cost: 2, power: 3, kind: 'draw',   text: 'Deal 3 damage. Draw 1.' },
  { id: 'coral-leviathan', name: 'Coral Leviathan', suit: 'tide',  cost: 3, power: 5, kind: 'attack', text: 'Deal 5 damage.' },
  { id: 'zephyr-hawk',     name: 'Zephyr Hawk',     suit: 'gale',  cost: 1, power: 2, kind: 'attack', text: 'Deal 2 damage.' },
  { id: 'storm-kite',      name: 'Storm Kite',      suit: 'gale',  cost: 2, power: 4, kind: 'attack', text: 'Deal 4 damage.' },
  { id: 'tempest-roc',     name: 'Tempest Roc',     suit: 'gale',  cost: 3, power: 6, kind: 'attack', text: 'Deal 6 damage.' },
  { id: 'pebble-golem',    name: 'Pebble Golem',    suit: 'stone', cost: 1, power: 1, kind: 'guard',  text: 'Deal 1 damage. +3 block.' },
  { id: 'quartz-badger',   name: 'Quartz Badger',   suit: 'stone', cost: 2, power: 3, kind: 'guard',  text: 'Deal 3 damage. +2 block.' },
  { id: 'mountain-titan',  name: 'Mountain Titan',  suit: 'stone', cost: 3, power: 5, kind: 'guard',  text: 'Deal 5 damage. +3 block.' },
  { id: 'lantern-mend',    name: 'Lantern Mend',    suit: 'lantern', cost: 2, power: 6, kind: 'heal', text: 'Restore 6 life.' },
  { id: 'ember-surge',     name: 'Ember Surge',     suit: 'lantern', cost: 2, power: 4, kind: 'surge', text: 'Deal 4 damage.' },
  { id: 'second-wind',     name: 'Second Wind',     suit: 'lantern', cost: 1, power: 2, kind: 'draw', text: 'Draw 2 cards.' },
];

// Resonance: the second card of a suit played in one turn gains +2 power.
export const RESONANCE_BONUS = 2;
export const MAX_LIFE = 30;
export const MAX_ENERGY = 8;
export const HAND_LIMIT = 7;
export const START_HAND = 4;

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

export function suitOf(card) {
  return SUITS[card.suit];
}
