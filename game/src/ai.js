// Lantern Clash — Sable's brain. A greedy planner with readable priorities:
// heal when hurt, guard when threatened, otherwise spend embers on the
// biggest hit — and hold a second card of a suit it already played so the
// Resonance bonus lands. It never sees the player's hand.
import { effectivePower, resonanceBonusFor } from './engine.js';

export function chooseFoePlays(state, rng) {
  const foe = state.foe;
  let energy = Math.min(2 + state.round, 8);
  const plays = [];
  const hand = [...foe.hand];
  const suitsPlayed = [];

  const affordable = () => hand.filter((c) => c.cost <= energy && !plays.includes(c));
  const bonusFor = (card) => (suitsPlayed.includes(card.suit) ? 2 : 0);

  // 1. Heal when badly hurt and a mend is in hand.
  const mend = affordable().find((c) => c.kind === 'heal');
  if (mend && foe.life <= 14) {
    plays.push(mend); energy -= mend.cost; suitsPlayed.push(mend.suit);
  }

  // 2. Keep playing while embers remain, best value first.
  let guard = 0;
  while (true) {
    const options = affordable();
    if (options.length === 0) break;
    // Score each card: damage now, plus block value, plus draw value.
    const scored = options.map((c) => {
      let score = 0;
      const power = c.power + bonusFor(c);
      if (c.kind === 'attack' || c.kind === 'surge') score = power * 2;
      if (c.kind === 'guard') score = power * 2 + 3;
      if (c.kind === 'draw') score = c.id === 'tide-serpent' ? power * 2 + 2 : 3;
      if (c.kind === 'heal') score = foe.life <= 20 ? 8 : 1;
      // Favour a card that sets up Resonance for a bigger partner next.
      const partner = hand.find((h) => h !== c && h.suit === c.suit && h.cost <= energy - c.cost);
      if (partner) score += 1.5;
      // Guard matters more when the player can hit hard next turn.
      if (c.kind === 'guard' && state.you.hand.length >= 4) score += 1;
      score += rng() * 0.6; // a little unpredictability
      return { card: c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (best.score <= 0) break;
    plays.push(best.card);
    energy -= best.card.cost;
    suitsPlayed.push(best.card.suit);
    if (best.card.kind === 'guard') guard++;
    if (guard >= 2) break; // never stack more than two guards a turn
  }
  return plays;
}

// Sable's taunts and reactions, shown in the battle log.
export const FOE_LINES = {
  open: [
    'Sable lights her lantern. “Let us see whose flame burns longer.”',
    'Sable: “The isles favour the bold. Play well.”',
  ],
  hurt: [
    'Sable winces. “A sharp spark, that one.”',
    'Sable: “Hmph. You have teeth after all.”',
  ],
  strong: [
    'Sable smiles. “Watch and learn, Warden.”',
    'Sable: “My lanterns answer to me.”',
  ],
};
