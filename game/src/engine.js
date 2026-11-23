// Lantern Clash — the rules engine: turns, energy, damage, block, healing,
// Resonance combos and win/loss. No DOM here; render.js draws the state.
import { CARD_DEFS, MAX_LIFE, MAX_ENERGY, HAND_LIMIT, START_HAND, RESONANCE_BONUS } from './cards.js';
import { buildDeck, drawCards, makeRng } from './deck.js';

export function energyForRound(round) {
  return Math.min(2 + round, MAX_ENERGY);
}

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    phase: 'title', // title | playing | won | lost
    round: 1,
    turn: 'you',
    you: freshFighter(rng),
    foe: freshFighter(rng),
    energy: energyForRound(1),
    energyMax: energyForRound(1),
    playedThisTurn: [],
    suitsPlayed: [],
    log: [],
    cardsPlayed: 0,
    damageDealt: 0,
  };
  drawCards(state.you.deck, state.you.hand, START_HAND, HAND_LIMIT);
  drawCards(state.foe.deck, state.foe.hand, START_HAND, HAND_LIMIT);
  return state;
}

function freshFighter(rng) {
  return {
    life: MAX_LIFE,
    block: 0,
    deck: buildDeck(rng),
    hand: [],
    discard: [],
  };
}

export function resonanceBonusFor(state, card) {
  return state.suitsPlayed.includes(card.suit) ? RESONANCE_BONUS : 0;
}

export function effectivePower(state, card) {
  const bonus = resonanceBonusFor(state, card);
  if (card.kind === 'heal') return card.power; // healing is not boosted
  return card.power + bonus;
}

export function canPlay(state, card) {
  return state.phase === 'playing' && state.turn === 'you' && card.cost <= state.energy;
}

function dealDamage(target, amount) {
  const absorbed = Math.min(target.block, amount);
  target.block -= absorbed;
  const hurt = amount - absorbed;
  target.life = Math.max(0, target.life - hurt);
  return { absorbed, hurt };
}

// Resolve one played card. Returns a description of what happened.
export function playCard(state, side, card) {
  const me = state[side];
  const other = state[side === 'you' ? 'foe' : 'you'];
  const idx = me.hand.findIndex((c) => c.uid === card.uid);
  if (idx < 0) return null;
  me.hand.splice(idx, 1);
  me.discard.push(card);
  state.cardsPlayed++;
  const power = effectivePower(state, card);
  const resonant = resonanceBonusFor(state, card) > 0;
  state.suitsPlayed.push(card.suit);
  const result = { card, power, resonant, kind: card.kind, events: [] };

  if (card.kind === 'heal') {
    const before = me.life;
    me.life = Math.min(MAX_LIFE, me.life + card.power);
    result.events.push({ type: 'heal', amount: me.life - before });
  } else if (card.kind === 'draw') {
    if (card.power > 0 && card.id === 'tide-serpent') {
      const hit = dealDamage(other, power);
      result.events.push({ type: 'damage', ...hit, power });
      state.damageDealt += hit.hurt;
    }
    const drawn = drawCards(me.deck, me.hand, card.id === 'second-wind' ? 2 : 1, HAND_LIMIT);
    result.events.push({ type: 'draw', amount: drawn.length });
  } else {
    const hit = dealDamage(other, power);
    result.events.push({ type: 'damage', ...hit, power });
    state.damageDealt += side === 'you' ? hit.hurt : 0;
    if (card.kind === 'guard') {
      const blockGain = card.id === 'pebble-golem' ? 3 : card.id === 'quartz-badger' ? 2 : 3;
      me.block += blockGain;
      result.events.push({ type: 'block', amount: blockGain });
    }
  }
  return result;
}

export function spendEnergy(state, cost) {
  state.energy = Math.max(0, state.energy - cost);
}

export function startPlayerTurn(state) {
  state.turn = 'you';
  state.energyMax = energyForRound(state.round);
  state.energy = state.energyMax;
  state.you.block = 0;
  state.playedThisTurn = [];
  state.suitsPlayed = [];
  if (state.round > 1) drawCards(state.you.deck, state.you.hand, 1, HAND_LIMIT);
}

export function startFoeTurn(state) {
  state.turn = 'foe';
  state.foe.block = 0;
  state.suitsPlayed = [];
  drawCards(state.foe.deck, state.foe.hand, 1, HAND_LIMIT);
}

export function endRound(state) {
  state.round++;
}

export function checkEnd(state) {
  if (state.foe.life <= 0) state.phase = 'won';
  else if (state.you.life <= 0) state.phase = 'lost';
  return state.phase;
}

export function logLine(state, html) {
  state.log.unshift(html);
  if (state.log.length > 40) state.log.length = 40;
}

export { CARD_DEFS };
