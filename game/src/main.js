// Lantern Clash — boot, input and turn flow. Owns the screens (title, help,
// victory, defeat), keyboard and mouse, the AI's turn, and the deterministic
// ?shot= states used to take the entry's screenshots.
import { CARD_DEFS, MAX_LIFE } from './cards.js';
import { cardById } from './cards.js';
import {
  newGame, playCard, spendEnergy, canPlay, checkEnd, startPlayerTurn,
  startFoeTurn, endRound, logLine, effectivePower,
} from './engine.js';
import { chooseFoePlays, FOE_LINES } from './ai.js';
import { renderAll, renderPlayed, showBanner, flashFighter } from './render.js';
import { playSound, unlockSound, setMuted, isMuted } from './sound.js';

const $ = (id) => document.getElementById(id);
let state = null;
let aiTimer = null;

function describePlay(side, result) {
  const who = side === 'you' ? '<b>You</b>' : '<b>Sable</b>';
  const card = result.card;
  const res = result.resonant ? ' <b>(Resonance +2!)</b>' : '';
  const parts = [`${who} played <b>${card.name}</b>${res}`];
  for (const ev of result.events) {
    if (ev.type === 'damage') {
      parts.push(`dealt <b>${ev.hurt}</b> damage${ev.absorbed ? ` (${ev.absorbed} blocked)` : ''}`);
    } else if (ev.type === 'heal') parts.push(`restored <b>${ev.amount}</b> life`);
    else if (ev.type === 'block') parts.push(`gained <b>${ev.amount}</b> block`);
    else if (ev.type === 'draw') parts.push(`drew <b>${ev.amount}</b> card${ev.amount === 1 ? '' : 's'}`);
  }
  return parts.join(' — ') + '.';
}

function refresh() {
  renderAll(state, { onPlayCard });
  renderPlayed(state);
}

function showEndScreen() {
  const screen = $('endScreen');
  const won = state.phase === 'won';
  screen.classList.remove('hidden', 'win', 'loss');
  screen.classList.add(won ? 'win' : 'loss');
  $('endEmblem').textContent = won ? '🏮✨' : '🕯️';
  $('endTitle').textContent = won ? 'Victory!' : 'Defeat';
  $('endText').textContent = won
    ? 'Your lantern outshines Sable’s. The Ember Isles are yours — the Far Lantern dims, and the Warden’s flame burns on.'
    : 'Your lantern gutters out. Sable bows, relights your wick, and waits for the rematch.';
  $('endStats').textContent =
    `Rounds: ${state.round} · Cards played: ${state.cardsPlayed} · Damage dealt: ${state.damageDealt} · Your life: ${state.you.life}/${MAX_LIFE} · Sable’s life: ${state.foe.life}/${MAX_LIFE}`;
  screen.classList.remove('hidden');
  playSound(won ? 'win' : 'lose');
}

function maybeEnd() {
  const phase = checkEnd(state);
  refresh();
  if (phase === 'won' || phase === 'lost') {
    window.setTimeout(showEndScreen, 650);
    return true;
  }
  return false;
}

function onPlayCard(card) {
  if (!state || !canPlay(state, card)) return;
  unlockSound();
  spendEnergy(state, card.cost);
  const result = playCard(state, 'you', card);
  if (!result) return;
  state.playedThisTurn.push(result);
  logLine(state, describePlay('you', result));
  if (result.events.some((e) => e.type === 'damage')) { playSound('hit'); flashFighter('foe'); }
  else if (result.events.some((e) => e.type === 'heal')) playSound('heal');
  else playSound('play');
  if (maybeEnd()) return;
  refresh();
}

function endTurn() {
  if (!state || state.phase !== 'playing' || state.turn !== 'you') return;
  state.turn = 'foe';
  refresh();
  startFoeTurn(state);
  const plays = chooseFoePlays(state, Math.random);
  let step = 0;
  const playNext = () => {
    if (!state || state.phase !== 'playing') return;
    if (step >= plays.length) {
      endRound(state);
      startPlayerTurn(state);
      logLine(state, `<b>Round ${state.round}</b> — your turn. You gain ${state.energyMax} embers and draw a card.`);
      showBanner('Your turn');
      playSound('turn');
      refresh();
      return;
    }
    const card = plays[step++];
    const result = playCard(state, 'foe', card);
    if (result) {
      state.playedThisTurn.push(result);
      logLine(state, describePlay('foe', result));
      if (result.events.some((e) => e.type === 'damage')) { playSound('hit'); flashFighter('you'); }
      else playSound('play');
    }
    if (maybeEnd()) return;
    refresh();
    aiTimer = window.setTimeout(playNext, 750);
  };
  aiTimer = window.setTimeout(playNext, 650);
}

function startGame(seed) {
  if (aiTimer) window.clearTimeout(aiTimer);
  state = newGame(seed ?? Math.floor(Math.random() * 1e9));
  state.phase = 'playing';
  $('titleScreen').classList.add('hidden');
  $('endScreen').classList.add('hidden');
  $('helpScreen').classList.add('hidden');
  logLine(state, FOE_LINES.open[0]);
  logLine(state, '<b>Round 1</b> — your turn. You gain 3 embers and hold 4 cards.');
  showBanner('Your turn — play a card!');
  refresh();
}

function backToTitle() {
  if (aiTimer) window.clearTimeout(aiTimer);
  state = newGame(Math.floor(Math.random() * 1e9));
  state.phase = 'title';
  $('endScreen').classList.add('hidden');
  $('helpScreen').classList.add('hidden');
  $('titleScreen').classList.remove('hidden');
  refresh();
}

function bindInput() {
  $('startBtn').addEventListener('click', () => { unlockSound(); playSound('turn'); startGame(); });
  $('againBtn').addEventListener('click', () => startGame());
  $('titleBtn').addEventListener('click', backToTitle);
  $('endTurnBtn').addEventListener('click', () => { unlockSound(); endTurn(); });
  $('helpBtn').addEventListener('click', () => $('helpScreen').classList.remove('hidden'));
  $('closeHelpBtn').addEventListener('click', () => $('helpScreen').classList.add('hidden'));
  $('muteBtn').addEventListener('click', () => {
    setMuted(!isMuted());
    $('muteBtn').textContent = isMuted() ? '🔇 Muted' : '🔊 Sound';
  });
  document.addEventListener('keydown', (e) => {
    if (!state) return;
    if (e.key >= '1' && e.key <= '7') {
      const card = state.you.hand[Number(e.key) - 1];
      if (card) onPlayCard(card);
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (!$('helpScreen').classList.contains('hidden')) { $('helpScreen').classList.add('hidden'); return; }
      if (state.phase === 'title') { startGame(); return; }
      e.preventDefault();
      endTurn();
    } else if (e.key === 'r' || e.key === 'R') {
      if (state.phase === 'playing' || state.phase === 'won' || state.phase === 'lost') startGame();
    } else if (e.key === 'm' || e.key === 'M') {
      setMuted(!isMuted());
      $('muteBtn').textContent = isMuted() ? '🔇 Muted' : '🔊 Sound';
    } else if (e.key === 'h' || e.key === 'H') {
      $('helpScreen').classList.toggle('hidden');
    } else if (e.key === 'Escape') {
      $('helpScreen').classList.add('hidden');
    }
  });
}

// ---- Screenshot mode: ?shot=title|battle|win|loss (and optional ?seed=N).
// Builds a fixed, deterministic table through the same state and render code
// the live game uses, so screenshots are real renders of the game itself.
function handFromIds(ids) {
  return ids.map((id, i) => ({ ...cardById(id), uid: `${id}-shot-${i}` }));
}

function applyShot(shot) {
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') || 7);
  state = newGame(seed);
  state.phase = 'playing';
  $('titleScreen').classList.add('hidden');

  if (shot === 'title') {
    state.phase = 'title';
    $('titleScreen').classList.remove('hidden');
    refresh();
    return;
  }

  if (shot === 'battle') {
    state.round = 5;
    state.energyMax = 6;
    state.energy = 5;
    state.you.life = 18;
    state.you.block = 3;
    state.foe.life = 24;
    state.foe.block = 0;
    state.you.hand = handFromIds(['pyre-drake', 'tide-serpent', 'quartz-badger', 'lantern-mend', 'ember-fox']);
    state.foe.hand = handFromIds(['cinder-imp', 'mist-wisp', 'zephyr-hawk', 'storm-kite', 'pebble-golem']);
    state.playedThisTurn = [
      { card: { ...cardById('storm-kite'), uid: 'storm-kite-shot' }, power: 4, resonant: false },
      { card: { ...cardById('ember-fox'), uid: 'ember-fox-shot' }, power: 6, resonant: true },
    ];
    state.suitsPlayed = ['gale', 'flame'];
    state.cardsPlayed = 9;
    state.damageDealt = 14;
    state.log = [
      '<b>You</b> played <b>Ember Fox</b> <b>(Resonance +2!)</b> — dealt <b>6</b> damage.',
      '<b>Sable</b> played <b>Storm Kite</b> — dealt <b>4</b> damage.',
      '<b>You</b> played <b>Quartz Badger</b> — dealt <b>3</b> damage — gained <b>2</b> block.',
      '<b>Round 5</b> — your turn. You gain 6 embers and draw a card.',
    ];
    refresh();
    return;
  }

  if (shot === 'win') {
    state.round = 8;
    state.you.life = 11;
    state.foe.life = 0;
    state.cardsPlayed = 17;
    state.damageDealt = 31;
    state.you.hand = handFromIds(['pyre-drake', 'ember-fox']);
    state.foe.hand = handFromIds(['cinder-imp']);
    state.log = ['<b>You</b> played <b>Pyre Drake</b> — dealt <b>6</b> damage.'];
    state.phase = 'won';
    refresh();
    showEndScreen();
    return;
  }

  if (shot === 'loss') {
    state.round = 7;
    state.you.life = 0;
    state.foe.life = 9;
    state.cardsPlayed = 13;
    state.damageDealt = 21;
    state.you.hand = handFromIds(['mist-wisp', 'pebble-golem']);
    state.foe.hand = handFromIds(['pyre-drake', 'tempest-roc']);
    state.log = ['<b>Sable</b> played <b>Tempest Roc</b> — dealt <b>6</b> damage.'];
    state.phase = 'lost';
    refresh();
    showEndScreen();
  }
}

function boot() {
  bindInput();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    applyShot(shot);
  } else {
    state = newGame(Math.floor(Math.random() * 1e9));
    state.phase = 'title';
    refresh();
  }
  // Exposed for play-testing and debugging only; the game never reads it.
  window.__lanternClash = { get state() { return state; }, startGame };
}

boot();
