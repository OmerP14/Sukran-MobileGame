import type { Card, GamePhase, GameState, Player, Rank } from "../src/types/game";

export function makeCard(rank: Rank, suit: Card["suit"] = "hearts", idSuffix = ""): Card {
  return { id: `${rank}-${suit}${idSuffix}`, suit, rank };
}

export function makeCards(rank: Rank, count: number): Card[] {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
  return Array.from({ length: count }, (_, i) => makeCard(rank, suits[i % suits.length], `-${i}`));
}

export function makePlayer(overrides: Partial<Player> & { id: string }): Player {
  return {
    name: overrides.id,
    type: "human",
    hand: [],
    completedSets: [],
    ...overrides,
  };
}

export function makeState(overrides: Partial<GameState> & { players: Player[] }): GameState {
  return {
    currentPlayerId: overrides.players[0].id,
    phase: "waiting_for_request" as GamePhase,
    turnNumber: 1,
    winnerIds: [],
    ...overrides,
  };
}
