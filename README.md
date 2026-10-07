<p align="center">
  <img src="assets/icon.png" width="120" alt="Şükran icon">
</p>

<h1 align="center">Şükran — Mobile Card Game</h1>

<p align="center">
  <b>English</b> · <a href="README.tr.md">Türkçe</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white" alt="Expo SDK 54">
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black" alt="React Native 0.81">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Zustand-state-443E38" alt="Zustand">
</p>

A mobile take on **Şükran**, a traditional Turkish card game, built with **React Native (Expo)** and **TypeScript**. Four players at a table ask each other for cards, try to complete sets of four, and have to remember to say *"Şükran!"* (thanks) in time to keep their turn. You play against three bots with different difficulty levels, across tiered rooms with their own stakes, clocks and currencies.

---

## Screenshots

| Login | Lobby | Rooms |
|---|---|---|
| ![Login](screenshots/01_login.png) | ![Lobby](screenshots/02_lobby.png) | ![Rooms](screenshots/03_rooms.png) |

| Table setup | Game table | Şükran! |
|---|---|---|
| ![Table setup](screenshots/04_table_setup.png) | ![Game table](screenshots/05_game_table.png) | ![Şükran button](screenshots/08_sukran.png) |

| Ask: who? | Ask: which card? | Late game |
|---|---|---|
| ![Pick opponent](screenshots/06_request_target.png) | ![Pick rank](screenshots/07_request_rank.png) | ![Late game](screenshots/09_late_game.png) |

> Screenshots were taken from the web build with a local demo profile (no live Firebase backend).

## How the game works

| | |
|---|---|
| **Setup** | 4 players (you + 3 bots), standard 52-card deck, 13 cards each. |
| **Goal** | Collect all 4 cards of the same rank (e.g. four Kings). |
| **Asking** | On your turn, pick an opponent, a rank and an amount (1–3), then tap *Ask*. You don't need to hold that rank yourself. |
| **Giving** | If the opponent has at least that many, they hand over exactly that many. Otherwise nothing is given and they just say *"No"*. |
| **Şükran** | After a successful ask, a **ŞÜKRAN** button appears. Tap it before the timer runs out and you keep your turn. Miss it and the turn passes to the player who gave you the cards. |
| **Turn passing** | A *"No"* passes the turn straight to the player you asked. |
| **Sets** | Four of a kind leave your hand automatically and count as a completed set. |
| **End** | When all 13 ranks are completed, the player with the most sets wins. Ties are allowed. |

## Features

- **Complete game engine.** Deck, dealing, requests, Şükran phase, set completion, game over and ranking live in pure TypeScript modules under [`src/game/`](src/game).
- **Bot AI with 3 difficulty levels.** Bots remember recent successful asks, prefer ranks they already hold, and sometimes "forget" to say Şükran (30% / 15% / 6% for easy / normal / hard).
- **Two currencies, tiered rooms.**
  - **Lokum** rooms: *Newbies → Experienced → Masters → Legends*. Higher rooms bring tougher bots, shorter Şükran windows (2.5 s → 1 s) and bigger stakes (1,000 → 50,000).
  - **Points** rooms: 3 tiers with a flat entry fee.
  - Daily free lokum top-up so players never get fully stuck.
- **Prize pool payouts.** The winner takes most of the pot and second place gets their stake back. Tied players share the prizes for the positions they span ([`payout.ts`](src/game/payout.ts)).
- **Host table settings.** The table host can adjust the Şükran and request timers within limits before the game starts.
- **Accounts and friends (Firebase).** Guest login or a real account with a unique display name. You can search players and send, accept or decline friend requests. Guests are hidden from search. Access is enforced by [`firestore.rules`](firestore.rules).
- **Statistics.** Games played and won, win rate, total sets, successful and failed asks, forgotten Şükrans, best score.
- **Polish.** Dealing animation (Reanimated), sound effects for every game event, haptics, a "hurry up" ticking cue on the request timer, and a landscape card-table UI with Cinzel fonts and gold accents.

## Tech stack

- [Expo](https://expo.dev) SDK 54 · React Native 0.81 · React 19
- **Expo Router** (file-based routing, typed routes)
- **TypeScript**
- **Zustand** for game, profile, friends and settings state
- **Firebase**: Anonymous Auth + Firestore (with AsyncStorage persistence)
- `react-native-reanimated`, `expo-linear-gradient`, `expo-audio`, `expo-haptics`
- ESLint (`eslint-config-expo`) + Prettier

## Project structure

```
├── app/                    # Screens (Expo Router)
│   ├── login.tsx           # Guest / account login
│   ├── lobby.tsx           # Currency + tier selection
│   ├── rooms.tsx           # Tables in a tier, host settings
│   ├── game.tsx            # The card table
│   ├── result.tsx          # Ranking & payout
│   ├── friends.tsx         # Search, requests, friend list
│   ├── statistics.tsx
│   └── rules.tsx
├── src/
│   ├── game/               # Pure game logic: deck, rules, turn, request, sets, bot-ai, payout
│   ├── store/              # Zustand stores (game, profile, friends, settings)
│   ├── components/         # Cards, hands, seats, banners, panels
│   ├── constants/          # Cards, timings, tiers, theme
│   ├── config/firebase.ts
│   └── utils/              # Sound, storage, random, formatting
├── assets/                 # Icons, lokum image, sound effects
├── firestore.rules         # Firestore security rules
└── FIREBASE_SETUP.md       # Step-by-step Firebase setup (Turkish)
```

## Getting started

```bash
git clone https://github.com/OmerP14/Sukran-MobileGame.git
cd Sukran-MobileGame
npm install
npm start          # then press a for Android, i for iOS, or scan the QR with Expo Go
```

### Firebase (for accounts & friends)

Create a `.env.local` file in the project root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Enable **Anonymous Authentication**, create a **Firestore** database and paste in [`firestore.rules`](firestore.rules). The full walkthrough is in [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md).

> Without the Firebase config the app logs a warning and accounts and friends won't work.

## Scripts

```bash
npm start          # Expo dev server
npm run android    # Open on Android
npm run ios        # Open on iOS
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier
```

## Limitations

- Games are played **against bots**. Friends and accounts are online, but there is no real-time multiplayer at the table yet.
- The in-game UI is in Turkish only.
- No automated test suite yet.

## License

No license file yet, so all rights are reserved by default. Open an issue if you'd like to use the code.
