import type { LastMove, Player, Rank, Suit } from "../types/game";

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

// Turkish names for the face cards, per the game's own vocabulary (Vale/Kız/Papaz).
export const RANK_LABELS: Record<Rank, string> = {
  A: "As",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  J: "Vale",
  Q: "Kız",
  K: "Papaz",
};

export function isRedSuit(suit: Suit): boolean {
  return suit === "hearts" || suit === "diamonds";
}

export function getPlayerName(players: Player[], playerId: string | undefined): string {
  if (!playerId) {
    return "";
  }
  return players.find((p) => p.id === playerId)?.name ?? playerId;
}

// Our players are always one of these four fixed names, so a lookup gives
// exact Turkish vowel-harmony/consonant-devoicing suffixes ("Bot 3'ten", not
// "Bot 3'dan"; "Bot 2'ye", not "Bot 2'e") instead of a generic — and wrong —
// hardcoded "'dan"/"'e".
const ABLATIVE_SUFFIX: Record<string, string> = {
  Sen: "'den",
  "Bot 1": "'den",
  "Bot 2": "'den",
  "Bot 3": "'ten",
};

const DATIVE_SUFFIX: Record<string, string> = {
  Sen: "'e",
  "Bot 1": "'e",
  "Bot 2": "'ye",
  "Bot 3": "'e",
};

export function withAblative(name: string): string {
  return `${name}${ABLATIVE_SUFFIX[name] ?? "'den"}`;
}

export function withDative(name: string): string {
  return `${name}${DATIVE_SUFFIX[name] ?? "'e"}`;
}

/** Wraps `text` in the `**…**` markers `GameMessage` renders as emphasized. */
export function emphasize(text: string): string {
  return `**${text}**`;
}

export function formatLastMoveMessage(lastMove: LastMove | undefined, players: Player[]): string {
  if (!lastMove) {
    return "Oyun başladı.";
  }
  const requester = getPlayerName(players, lastMove.requesterId);
  const target = getPlayerName(players, lastMove.targetPlayerId);
  const rankLabel = RANK_LABELS[lastMove.rank];

  if (lastMove.forgotSukran === true) {
    return `${emphasize(requester)} Şükran demeyi unuttu!`;
  }
  if (!lastMove.success) {
    return `${emphasize(requester)}, ${emphasize(withAblative(target))} ${emphasize(`${lastMove.requestedAmount} ${rankLabel}`)} istedi. ${emphasize("Yok!")}`;
  }
  return `${emphasize(requester)}, ${emphasize(withAblative(target))} ${emphasize(`${lastMove.transferredAmount} ${rankLabel}`)} aldı.`;
}
