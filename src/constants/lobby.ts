import type { BotDifficulty, CurrencySystem } from "../types/game";

export type { CurrencySystem };
export type LokumTierId = "newbie" | "experienced" | "master" | "legend";
export type PointsTierId = "low" | "mid" | "high";
export type TierId = LokumTierId | PointsTierId;

export interface TierInfo {
  id: TierId;
  label: string;
  min: number;
  max?: number;
}

// Lokum rooms: 4 tiers. Higher rooms mean tougher bots and tighter clocks.
export const LOKUM_TIERS: TierInfo[] = [
  { id: "newbie", label: "Yeniler", min: 0, max: 1000 },
  { id: "experienced", label: "Tecrübeliler", min: 1001, max: 5000 },
  { id: "master", label: "Ustalar", min: 5001, max: 20000 },
  { id: "legend", label: "Efsaneler", min: 20001 },
];

// Puanlı rooms: just 3, keyed off current points balance. Entry is a flat
// fee (POINTS_ENTRY_FEE in constants/config.ts) regardless of which one.
export const POINTS_TIERS: TierInfo[] = [
  { id: "low", label: "Yeniler", min: 0, max: 5999 },
  { id: "mid", label: "Tecrübeliler", min: 6000, max: 10000 },
  { id: "high", label: "Ustalar", min: 10001 },
];

export function tiersForSystem(system: CurrencySystem): TierInfo[] {
  return system === "lokum" ? LOKUM_TIERS : POINTS_TIERS;
}

export const CURRENCY_INFO: Record<CurrencySystem, { name: string }> = {
  points: { name: "Puan" },
  lokum: { name: "Lokum" },
};

// The default stake a lokum table's host is offered — round numbers rather
// than the tier's exact unlock range. Puanlı tables don't have a per-tier
// stake at all, just the flat POINTS_ENTRY_FEE.
export const TIER_STAKE: Record<LokumTierId, number> = {
  newbie: 1000,
  experienced: 5000,
  master: 20000,
  legend: 50000,
};

// Bots get tougher the higher the room. Puanlı rooms don't vary this.
export const TIER_BOT_DIFFICULTY: Record<TierId, BotDifficulty> = {
  newbie: "easy",
  experienced: "normal",
  master: "hard",
  legend: "hard",
  low: "normal",
  mid: "normal",
  high: "normal",
};

// Default Şükran duration per room (ms) — shorter the higher you climb.
export const TIER_SUKRAN_TIMEOUT_MS: Record<TierId, number> = {
  newbie: 2500,
  experienced: 2000,
  master: 1500,
  legend: 1000,
  low: 2000,
  mid: 2000,
  high: 2000,
};

// Default card-request countdown per room (ms).
export const TIER_REQUEST_TIMEOUT_MS: Record<TierId, number> = {
  newbie: 12000,
  experienced: 10000,
  master: 8000,
  legend: 6000,
  low: 10000,
  mid: 10000,
  high: 10000,
};

// How much of the request countdown (counting from the end) plays the
// "hurry up" ticking cue.
export const TIER_REQUEST_WARNING_MS: Record<TierId, number> = {
  newbie: 7000,
  experienced: 6000,
  master: 5000,
  legend: 2000,
  low: 6000,
  mid: 6000,
  high: 6000,
};

export function isTierUnlocked(tier: TierInfo, balance: number): boolean {
  return balance >= tier.min;
}

export function formatBalance(amount: number): string {
  return amount.toLocaleString("tr-TR");
}

export function formatTierRange(tier: TierInfo): string {
  const min = formatBalance(tier.min);
  return tier.max === undefined ? `${min} ve üstü` : `${min} - ${formatBalance(tier.max)}`;
}
