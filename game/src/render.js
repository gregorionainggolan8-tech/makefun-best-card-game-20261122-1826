// Lantern Clash — drawing the table: hands, life bars, energy, arena cards
// and the battle log. Everything is DOM; cards slide and flip with CSS.
import { SUITS, MAX_LIFE, MAX_ENERGY } from './cards.js';
import { effectivePower, resonanceBonusFor } from './engine.js';

const $ = (id) => document.getElementById(id);

export function cardElement(card, opts = {}) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card suit-${card.suit}`;
  el.dataset.uid = card.uid;
  const powerClass = card.kind === 'heal' ? 'heal' : card.kind === 'draw' ? 'draw' : '';
  const powerGlyph = card.kind === 'heal' ? '✚' : card.power;
  el.innerHTML =
    `<div class="cost" title="Cost in embers">${card.cost}</div>` +
    `<div class="resonanceTag">RESONANCE +2</div>` +
    `<div class="suitGlyph" aria-hidden="true">${suit.glyph}</div>` +
    `<div class="cardName">${card.name}</div>` +
    `<div class="cardSuit">${suit.label}</div>` +
    `<div class="cardText">${card.text}</div>` +
    `<div class="power ${powerClass}" title="Power">${powerGlyph}</div>`;
  if (opts.onClick) el.addEventListener('click', () => opts.onClick(card, el));
  return el;
}

export function renderAll(state, ui) {
  renderFighter($('foeLifeFill'), $('foeLifeText'), state.foe.life);
  renderFighter($('youLifeFill'), $('youLifeText'), state.you.life);
  $('foeBlock').textContent = `🛡 ${state.foe.block}`;
  $('youBlock').textContent = `🛡 ${state.you.block}`;
  $('foeDeckCount').textContent = state.foe.deck.length;
  $('youDeckCount').textContent = state.you.deck.length;
  $('roundBadge').textContent = `Round ${state.round}`;
  renderEnergy(state);
  renderFoeHand(state);
  renderYouHand(state, ui);
  renderLog(state);
  $('endTurnBtn').disabled = !(state.phase === 'playing' && state.turn === 'you');
  $('handCount').textContent = `${state.you.hand.length} cards in hand`;
}

function renderFighter(fillEl, textEl, life) {
  fillEl.style.width = `${(life / MAX_LIFE) * 100}%`;
  textEl.textContent = `${life} / ${MAX_LIFE}`;
}

function renderEnergy(state) {
  const pips = $('energyPips');
  pips.innerHTML = '';
  for (let i = 0; i < state.energyMax; i++) {
    const pip = document.createElement('span');
    pip.className = 'pip' + (i < state.energy ? ' lit' : '');
    pips.appendChild(pip);
  }
}

function renderFoeHand(state) {
  const hand = $('foeHand');
  hand.innerHTML = '';
  for (let i = 0; i < state.foe.hand.length; i++) {
    const back = document.createElement('div');
    back.className = 'cardBack';
    back.textContent = '🏮';
    hand.appendChild(back);
  }
}

function renderYouHand(state, ui) {
  const hand = $('youHand');
  hand.innerHTML = '';
  state.you.hand.forEach((card, i) => {
    const playable = state.phase === 'playing' && state.turn === 'you' && card.cost <= state.energy;
    const el = cardElement(card, { onClick: playable ? ui.onPlayCard : null });
    if (!playable) el.classList.add('unplayable');
    if (resonanceBonusFor(state, card) > 0) el.classList.add('resonant');
    el.title = `${card.name} — ${card.text} (press ${i + 1})`;
    hand.appendChild(el);
  });
}

export function renderLog(state) {
  const list = $('logList');
  list.innerHTML = '';
  for (const line of state.log) {
    const li = document.createElement('li');
    li.innerHTML = line;
    list.appendChild(li);
  }
}

// Show the cards just played in the arena, newest first, at most four.
export function renderPlayed(state) {
  const row = $('playedRow');
  row.innerHTML = '';
  for (const entry of state.playedThisTurn.slice(-4)) {
    const el = cardElement(entry.card);
    el.classList.add('justPlayed');
    row.appendChild(el);
  }
}

export function showBanner(text, ms = 1100) {
  const banner = $('turnBanner');
  banner.textContent = text;
  banner.classList.add('show');
  window.setTimeout(() => banner.classList.remove('show'), ms);
}

export function flashFighter(side) {
  const el = side === 'you' ? $('youFighter') : $('foeFighter');
  el.classList.remove('flashDamage');
  void el.offsetWidth; // restart the animation
  el.classList.add('flashDamage');
}

export { MAX_ENERGY };
