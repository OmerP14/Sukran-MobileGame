import type { Card, Player, Rank } from "../types/game";

export function findCompletedSets(hand: Card[]): Rank[] {
  const counts = new Map<Rank, number>();
  for (const card of hand) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  const completed: Rank[] = [];
  for (const [rank, count] of counts) {
    if (count >= 4) {
      completed.push(rank);
    }
  }
  return completed;
}

export function removeCompletedSets(player: Player): Player {
  const newlyCompleted = findCompletedSets(player.hand).filter(
    (rank) => !player.completedSets.includes(rank)
  );
  if (newlyCompleted.length === 0) {
    return player;
  }
  const hand = player.hand.filter((card) => !newlyCompleted.includes(card.rank));
  return {
    ...player,
    hand,
    completedSets: [...player.completedSets, ...newlyCompleted],
  };
}
