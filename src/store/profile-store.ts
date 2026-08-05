import { create } from "zustand";
import { loadJSON, saveJSON } from "../utils/storage";

export type LoginMethod = "guest" | "local";

export interface Profile {
  displayName: string;
  loginMethod: LoginMethod;
  points: number;
  lokum: number;
}

const PROFILE_STORAGE_KEY = "sukran/profile";

const STARTER_POINTS = 500;
const STARTER_LOKUM = 500;

function randomGuestName(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Misafir${suffix}`;
}

interface ProfileStore {
  profile: Profile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadJSON<Profile>(PROFILE_STORAGE_KEY);
    set({ profile: stored ?? null, hydrated: true });
  },

  loginAsGuest: async () => {
    const profile: Profile = {
      displayName: randomGuestName(),
      loginMethod: "guest",
      points: STARTER_POINTS,
      lokum: STARTER_LOKUM,
    };
    set({ profile });
    await saveJSON(PROFILE_STORAGE_KEY, profile);
  },

  loginWithName: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const profile: Profile = {
      displayName: trimmed,
      loginMethod: "local",
      points: STARTER_POINTS,
      lokum: STARTER_LOKUM,
    };
    set({ profile });
    await saveJSON(PROFILE_STORAGE_KEY, profile);
  },

  logout: async () => {
    set({ profile: null });
    await saveJSON(PROFILE_STORAGE_KEY, null);
  },
}));
