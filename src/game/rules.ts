import type { Card, GameState, Player, Rank } from "../types/game";

export function getPlayerById(state: GameState, playerId: string): Player {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }
  return player;
}

export function countCardsOfRank(hand: Card[], rank: Rank): number {
  return hand.filter((card) => card.rank === rank).length;
}

export function replacePlayer(state: GameState, updatedPlayer: Player): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
  };
}
