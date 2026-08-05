import { RANKS } from "../constants/cards";
import type { GameState } from "../types/game";

export function checkGameOver(state: GameState): boolean {
  const totalCompletedSets = state.players.reduce(
    (sum, player) => sum + player.completedSets.length,
    0
  );
  return totalCompletedSets >= RANKS.length;
}

export function calculateWinners(state: GameState): string[] {
  const maxSets = Math.max(...state.players.map((player) => player.completedSets.length));
  return state.players
    .filter((player) => player.completedSets.length === maxSets)
    .map((player) => player.id);
}
