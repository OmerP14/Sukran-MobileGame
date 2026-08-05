import { create } from "zustand";
import { loadJSON, saveJSON } from "../utils/storage";

export type CardSortOrder = "rank" | "suit";

export interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  cardSortOrder: CardSortOrder;
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  totalCompletedSets: number;
  successfulRequests: number;
  failedRequests: number;
  sukranForgotten: number;
  bestGameScore: number;
}

export interface GameResult {
  won: boolean;
  completedSets: number;
  successfulRequests: number;
  failedRequests: number;
  sukranForgotten: number;
}

const SETTINGS_STORAGE_KEY = "sukran/settings";
const STATISTICS_STORAGE_KEY = "sukran/statistics";

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  hapticsEnabled: true,
  cardSortOrder: "rank",
};

const DEFAULT_STATISTICS: Statistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalCompletedSets: 0,
  successfulRequests: 0,
  failedRequests: 0,
  sukranForgotten: 0,
  bestGameScore: 0,
};

export function winRate(statistics: Statistics): number {
  if (statistics.gamesPlayed === 0) {
    return 0;
  }
  return statistics.gamesWon / statistics.gamesPlayed;
}

interface SettingsStore {
  settings: Settings;
  statistics: Statistics;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  recordGameResult: (result: GameResult) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  statistics: DEFAULT_STATISTICS,
  hydrated: false,

  hydrate: async () => {
    const [storedSettings, storedStatistics] = await Promise.all([
      loadJSON<Settings>(SETTINGS_STORAGE_KEY),
      loadJSON<Statistics>(STATISTICS_STORAGE_KEY),
    ]);
    set({
      settings: { ...DEFAULT_SETTINGS, ...storedSettings },
      statistics: { ...DEFAULT_STATISTICS, ...storedStatistics },
      hydrated: true,
    });
  },

  updateSettings: async (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    await saveJSON(SETTINGS_STORAGE_KEY, settings);
  },

  recordGameResult: async (result) => {
    const previous = get().statistics;
    const statistics: Statistics = {
      gamesPlayed: previous.gamesPlayed + 1,
      gamesWon: previous.gamesWon + (result.won ? 1 : 0),
      totalCompletedSets: previous.totalCompletedSets + result.completedSets,
      successfulRequests: previous.successfulRequests + result.successfulRequests,
      failedRequests: previous.failedRequests + result.failedRequests,
      sukranForgotten: previous.sukranForgotten + result.sukranForgotten,
      bestGameScore: Math.max(previous.bestGameScore, result.completedSets),
    };
    set({ statistics });
    await saveJSON(STATISTICS_STORAGE_KEY, statistics);
  },
}));
