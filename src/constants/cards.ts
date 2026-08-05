import type { Rank, Suit } from "../types/game";

export const SUITS: readonly Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: readonly Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const PLAYER_COUNT = 4;

export const CARDS_PER_PLAYER = 13;
