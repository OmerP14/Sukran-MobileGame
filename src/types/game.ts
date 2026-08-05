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
}
