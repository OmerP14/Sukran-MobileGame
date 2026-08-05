import { signInAnonymously, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { auth, firestore } from "../config/firebase";
import type { CurrencySystem } from "../types/game";

export interface Profile {
  uid: string;
  displayName: string;
  isGuest: boolean;
  points: number;
  lokum: number;
  // "YYYY-MM-DD" — last day the free daily lokum top-up was applied.
  lastLokumRefillDate?: string;
}

// The Firestore document shape at users/{uid} — a superset of Profile
// (adds the lowercase name used for search) that never leaves this file.
interface UserDoc {
  displayName: string;
  displayNameLower: string;
  isGuest: boolean;
  points: number;
  lokum: number;
  lastLokumRefillDate?: string;
  createdAt: number;
}

const STARTER_POINTS = 5000;
const STARTER_LOKUM = 1000;

// Old starter balances, from before they were raised — an account saved
// with exactly both of these (never having played, so untouched since
// creation) gets bumped to the current starter values instead of staying
// stuck on numbers that no longer match what a new player gets.
const LEGACY_STARTER_POINTS = 500;
const LEGACY_STARTER_LOKUM = 500;

// Everyone's lokum tops back up to this once a day, but only if it's
// actually run low — a player sitting on plenty doesn't get a free top-up.
const LOKUM_DAILY_FLOOR = 1000;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function randomGuestName(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Misafir${suffix}`;
}

function userRef(uid: string) {
  return doc(firestore, "users", uid);
}

function profileFromDoc(uid: string, data: UserDoc): Profile {
  return {
    uid,
    displayName: data.displayName,
    isGuest: data.isGuest,
    points: data.points,
    lokum: data.lokum,
    lastLokumRefillDate: data.lastLokumRefillDate,
  };
}

// Same migrations that used to run against the local AsyncStorage copy —
// now checked/applied against the Firestore document once at sign-in.
async function applyBalanceMigrations(uid: string, data: UserDoc): Promise<UserDoc> {
  const updates: Partial<UserDoc> = {};

  if (data.points === LEGACY_STARTER_POINTS && data.lokum === LEGACY_STARTER_LOKUM) {
    updates.points = STARTER_POINTS;
    updates.lokum = STARTER_LOKUM;
  }

  const today = todayKey();
  if (data.lastLokumRefillDate !== today) {
    const currentLokum = updates.lokum ?? data.lokum;
    updates.lokum = currentLokum < LOKUM_DAILY_FLOOR ? LOKUM_DAILY_FLOOR : currentLokum;
    updates.lastLokumRefillDate = today;
  }

  if (Object.keys(updates).length === 0) {
    return data;
  }
  await updateDoc(userRef(uid), updates);
  return { ...data, ...updates };
}

async function isDisplayNameTaken(nameLower: string): Promise<boolean> {
  const usersQuery = query(
    collection(firestore, "users"),
    where("displayNameLower", "==", nameLower),
    limit(1)
  );
  const snapshot = await getDocs(usersQuery);
  return !snapshot.empty;
}

export type LoginWithNameResult = { ok: true } | { ok: false; reason: "empty" | "taken" };

interface ProfileStore {
  profile: Profile | null;
  hydrated: boolean;
  // The root layout's onAuthStateChanged listener calls this whenever
  // Firebase's own idea of "who's signed in" changes — that's the single
  // source of truth now, not anything stored locally by this file.
  syncWithAuthUser: (user: User | null) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  // Resolves { ok: false } instead of throwing so the login screen can show
  // an inline "isim alınmış" error without a try/catch.
  loginWithName: (name: string) => Promise<LoginWithNameResult>;
  logout: () => Promise<void>;
  // Deducts a table's entry cost up front. Resolves false (and changes
  // nothing) if the balance can't cover it.
  spendCurrency: (system: CurrencySystem, amount: number) => Promise<boolean>;
  // Adds a table's payout after a hand ends (see src/game/payout.ts). A
  // no-op for amount <= 0, so callers don't need to guard third/fourth place.
  creditCurrency: (system: CurrencySystem, amount: number) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  hydrated: false,

  syncWithAuthUser: async (user) => {
    if (!user) {
      set({ profile: null, hydrated: true });
      return;
    }
    const snap = await getDoc(userRef(user.uid));
    if (!snap.exists()) {
      // Signed in but no profile document yet (e.g. interrupted right after
      // signInAnonymously) — treat as logged out, login screen starts fresh.
      set({ profile: null, hydrated: true });
      return;
    }
    const data = await applyBalanceMigrations(user.uid, snap.data() as UserDoc);
    set({ profile: profileFromDoc(user.uid, data), hydrated: true });
  },

  loginAsGuest: async () => {
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;
    const displayName = randomGuestName();
    const data: UserDoc = {
      displayName,
      displayNameLower: displayName.toLowerCase(),
      isGuest: true,
      points: STARTER_POINTS,
      lokum: STARTER_LOKUM,
      lastLokumRefillDate: todayKey(),
      createdAt: Date.now(),
    };
    await setDoc(userRef(uid), data);
    set({ profile: profileFromDoc(uid, data) });
  },

  loginWithName: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { ok: false, reason: "empty" };
    }
    const displayNameLower = trimmed.toLowerCase();
    // Firestore rules require being signed in just to read `users` (needed
    // for search/uniqueness), so sign in anonymously first — the
    // availability check can't run before this without getting rejected as
    // a permissions error.
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;
    if (await isDisplayNameTaken(displayNameLower)) {
      return { ok: false, reason: "taken" };
    }
    const data: UserDoc = {
      displayName: trimmed,
      displayNameLower,
      isGuest: false,
      points: STARTER_POINTS,
      lokum: STARTER_LOKUM,
      lastLokumRefillDate: todayKey(),
      createdAt: Date.now(),
    };
    await setDoc(userRef(uid), data);
    set({ profile: profileFromDoc(uid, data) });
    return { ok: true };
  },

  logout: async () => {
    await signOut(auth);
    set({ profile: null });
  },

  spendCurrency: async (system, amount) => {
    const current = get().profile;
    if (!current) {
      return false;
    }
    const field = system === "lokum" ? "lokum" : "points";
    if (current[field] < amount) {
      return false;
    }
    set({ profile: { ...current, [field]: current[field] - amount } });
    await updateDoc(userRef(current.uid), { [field]: increment(-amount) });
    return true;
  },

  creditCurrency: async (system, amount) => {
    if (amount <= 0) {
      return;
    }
    const current = get().profile;
    if (!current) {
      return;
    }
    const field = system === "lokum" ? "lokum" : "points";
    set({ profile: { ...current, [field]: current[field] + amount } });
    await updateDoc(userRef(current.uid), { [field]: increment(amount) });
  },
}));
