// Canonical home for this type — constants/lobby.ts re-exports it rather
// than declaring its own, to avoid a circular import (lobby.ts already
// imports BotDifficulty from here).
export type CurrencySystem = "points" | "lokum";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerType = "human" | "bot";

export type BotDifficulty = "easy" | "normal" | "hard";

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  hand: Card[];
  completedSets: Rank[];
  botDifficulty?: BotDifficulty;
}

export interface CardRequest {
  requesterId: string;
  targetPlayerId: string;
  rank: Rank;
  amount: 1 | 2 | 3 | 4;
}

export interface LastMove {
  requesterId: string;
  targetPlayerId: string;
  rank: Rank;
  requestedAmount: number;
  success: boolean;
  transferredAmount: number;
  forgotSukran?: boolean;
}

export type GamePhase =
  | "setup"
  | "dealing"
  | "waiting_for_request"
  | "resolving_request"
  | "waiting_for_sukran"
  | "bot_turn"
  | "game_over";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  phase: GamePhase;
  lastMove?: LastMove;
  sukranTargetPlayerId?: string;
  turnNumber: number;
  winnerIds: string[];
  // Per-table config, set once at startGame from the room's tier (and
  // whatever the host adjusted it to) — not a global user preference.
  sukranTimeoutMs: number;
  requestTimeoutMs: number;
  requestWarningMs: number;
  // Which currency this table is playing for, and how much each of the 4
  // players put into the pot — needed at game-over time to work out payout.
  system: CurrencySystem;
  stake: number;
}
