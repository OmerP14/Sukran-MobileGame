import { CARDS_PER_PLAYER, RANKS, SUITS } from "../constants/cards";
import type { Card, Player } from "../types/game";
import { randomInt } from "../utils/random";

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}-${suit}`, suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], players: Player[]): Player[] {
  return players.map((player, playerIndex) => {
    const start = playerIndex * CARDS_PER_PLAYER;
    const hand = deck.slice(start, start + CARDS_PER_PLAYER);
    return { ...player, hand };
  });
}
