import type { BotDifficulty } from "../types/game";

// Şükran and card-request timeouts now come from the room's tier (see
// TIER_SUKRAN_TIMEOUT_MS / TIER_REQUEST_TIMEOUT_MS in constants/lobby.ts) and
// are host-adjustable within these bounds when setting up a table.
export const MIN_SUKRAN_TIMEOUT_MS = 1000;
export const MAX_SUKRAN_TIMEOUT_MS = 6000;
export const SUKRAN_TIMEOUT_STEP_MS = 500;

export const MIN_REQUEST_TIMEOUT_MS = 4000;
export const MAX_REQUEST_TIMEOUT_MS = 20000;
export const REQUEST_TIMEOUT_STEP_MS = 1000;

// Flat entry fee for every points-system table, regardless of room.
export const POINTS_ENTRY_FEE = 40;

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
