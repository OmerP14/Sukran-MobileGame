import type { BotDifficulty } from "../types/game";

export type CurrencySystem = "points" | "lokum";
export type TierId = "newbie" | "experienced" | "master" | "legend";

export interface TierInfo {
  id: TierId;
  label: string;
  min: number;
  max?: number;
}

// Shared thresholds for both currency systems — a player's rank in "Puanlı"
// and "Lokumlu" lobbies is read off the same ladder, just against a
// different balance.
export const TIERS: TierInfo[] = [
  { id: "newbie", label: "Yeniler", min: 0, max: 999 },
  { id: "experienced", label: "Tecrübeliler", min: 1000, max: 4999 },
  { id: "master", label: "Ustalar", min: 5000, max: 19999 },
  { id: "legend", label: "Efsaneler", min: 20000 },
];

export const CURRENCY_INFO: Record<CurrencySystem, { name: string }> = {
  points: { name: "Puan" },
  lokum: { name: "Lokum" },
};

export const TIER_BOT_DIFFICULTY: Record<TierId, BotDifficulty> = {
  newbie: "easy",
  experienced: "normal",
  master: "hard",
  legend: "hard",
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
