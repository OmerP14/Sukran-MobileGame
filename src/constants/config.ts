import type { BotDifficulty } from "../types/game";

export const DEFAULT_SUKRAN_TIMEOUT_MS = 2000;

// How long the human has to submit a card request before the game picks one automatically.
export const REQUEST_TIMEOUT_MS = 8000;
// Below this much time left, the request panel switches to an urgent "about to auto-pick" state.
export const REQUEST_WARNING_MS = 4000;

export const SET_ANNOUNCEMENT_DISPLAY_MS = 2000;

export const BOT_MOVE_DELAY_MIN_MS = 2200;
export const BOT_MOVE_DELAY_MAX_MS = 3800;

// How long a bot's "X'den Y istiyor…" announcement stays on screen before it resolves.
export const BOT_ANNOUNCE_MIN_MS = 1800;
export const BOT_ANNOUNCE_MAX_MS = 2600;

export const BOT_FORGET_SUKRAN_PROBABILITY: Record<BotDifficulty, number> = {
  easy: 0.3,
  normal: 0.15,
  hard: 0.06,
};
