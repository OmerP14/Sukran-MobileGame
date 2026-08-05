import type { CurrencySystem, Player } from "../types/game";

// Ranked by completed sets, most to least. Ties are broken by seat order
// here — only used internally by calculateResults, which resolves ties
// properly before anything is paid out.
function sortByCompletedSets(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.completedSets.length - a.completedSets.length);
}

// The pot is everyone's stake combined (4 players × stake). Winner takes
// most of it, second place gets their stake back, third and fourth get
// nothing — whatever's left over after that is the table's rake, simply
// never paid out to anyone. The two currencies use different ratios:
//
//   Lokum (pot = 4×stake):  1st = 2.5×stake, 2nd = 1×stake, rake = 0.5×stake
//   Puan  (pot = 4×stake):  1st = 2×stake,   2nd = 1×stake, rake = 1×stake
//
// `position` is 0-indexed (0 = 1st place).
function payoutForPosition(system: CurrencySystem, stake: number, position: number): number {
  if (system === "lokum") {
    if (position === 0) return stake * 2.5;
    if (position === 1) return stake;
    return 0;
  }
  if (position === 0) return stake * 2;
  if (position === 1) return stake;
  return 0;
}

export interface PlayerResult {
  playerId: string;
  // 1-indexed placement. Tied players share the same rank and the next
  // rank skips ahead accordingly (e.g. two tied for 1st → 1, 1, 3, 4) —
  // standard competition ranking, not a plain array position.
  rank: number;
  payout: number;
}

// Splits tied places the way a shared prize pool normally works: players
// tied on completed-set count pool together whichever positions their tie
// spans (e.g. two players tied for 1st pool the 1st+2nd prizes) and split
// it evenly, rather than one arbitrarily outscoring the other by seat order.
export function calculateResults(
  players: Player[],
  system: CurrencySystem,
  stake: number
): PlayerResult[] {
  const sorted = sortByCompletedSets(players);
  const results: PlayerResult[] = [];

  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].completedSets.length === sorted[i].completedSets.length) {
      j++;
    }
    const groupSize = j - i + 1;
    let pooled = 0;
    for (let position = i; position <= j; position++) {
      pooled += payoutForPosition(system, stake, position);
    }
    const share = pooled / groupSize;
    for (let k = i; k <= j; k++) {
      results.push({ playerId: sorted[k].id, rank: i + 1, payout: share });
    }
    i = j + 1;
  }

  return results;
}
