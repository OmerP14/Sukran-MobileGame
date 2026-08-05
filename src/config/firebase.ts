import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
// @ts-expect-error — getReactNativePersistence ships in the RN runtime build
// (firebase/auth's "react-native" package-export condition) but isn't part
// of the public .d.ts TypeScript resolves through that same subpath, a known
// gap in Firebase's package exports. Works fine at runtime via Metro.
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Filled in from the Firebase console (Project settings > Your apps > Web app
// config) once the project exists — see the setup steps handed off alongside
// this change. These values aren't secrets: Firebase's client config is safe
// to ship in an app bundle, actual access control lives in Firestore
// Security Rules, not in hiding this object.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!firebaseReady) {
  console.warn(
    "Firebase config missing (EXPO_PUBLIC_FIREBASE_* env vars) — accounts/friends won't work until it's set."
  );
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// React Native has no window.localStorage, so auth state doesn't persist
// across app restarts unless explicitly pointed at AsyncStorage.
let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  // initializeAuth throws if already called once for this app (e.g. Fast
  // Refresh re-running this module during development) — reuse the
  // instance it already created instead of crashing.
  auth = getAuth(app);
}

export { auth };
export const firestore = getFirestore(app);
