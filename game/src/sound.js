// Lantern Clash — tiny synthesized sounds. No audio files: every blip is an
// oscillator, so the game stays offline and file-free. Silently disabled
// until the first user gesture, and whenever the browser has no AudioContext.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

export function unlockSound() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function blip(freq, dur, type = 'sine', gain = 0.08) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  } catch {
    // Sound is decoration; a failure must never break the game.
  }
}

export function playSound(name) {
  if (name === 'play') blip(520, 0.12, 'triangle', 0.09);
  else if (name === 'hit') blip(180, 0.16, 'sawtooth', 0.07);
  else if (name === 'heal') { blip(660, 0.14, 'sine', 0.08); window.setTimeout(() => blip(880, 0.18, 'sine', 0.07), 90); }
  else if (name === 'draw') blip(740, 0.08, 'sine', 0.05);
  else if (name === 'turn') blip(440, 0.1, 'triangle', 0.06);
  else if (name === 'win') { [523, 659, 784, 1047].forEach((f, i) => window.setTimeout(() => blip(f, 0.22, 'triangle', 0.09), i * 130)); }
  else if (name === 'lose') { [392, 330, 262].forEach((f, i) => window.setTimeout(() => blip(f, 0.25, 'sine', 0.08), i * 160)); }
}
