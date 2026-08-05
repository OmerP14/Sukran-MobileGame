import { create } from "zustand";
import {
  BOT_ANNOUNCE_MAX_MS,
  BOT_ANNOUNCE_MIN_MS,
  BOT_MOVE_DELAY_MAX_MS,
  BOT_MOVE_DELAY_MIN_MS,
} from "../constants/config";
import { chooseBotMove, shouldBotForgetSukran } from "../game/bot-ai";
import { createDeck, dealCards, shuffleDeck } from "../game/deck";
import { calculateWinners, checkGameOver } from "../game/game-over";
import { requestCards } from "../game/request";
import {
  confirmSukran as confirmSukranPure,
  handleSukranTimeout as handleSukranTimeoutPure,
} from "../game/turn";
import type {
  BotDifficulty,
  CardRequest,
  CurrencySystem,
  GameState,
  Player,
  Rank,
} from "../types/game";
import { RANK_LABELS, emphasize, withAblative, withDative } from "../utils/format";
import { randomInt } from "../utils/random";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(minMs: number, maxMs: number): Promise<void> {
  return wait(minMs + randomInt(maxMs - minMs + 1));
}

function botThinkingDelay(): Promise<void> {
  return randomBetween(BOT_MOVE_DELAY_MIN_MS, BOT_MOVE_DELAY_MAX_MS);
}

function botAnnounceDelay(): Promise<void> {
  return randomBetween(BOT_ANNOUNCE_MIN_MS, BOT_ANNOUNCE_MAX_MS);
}

function createInitialPlayers(difficulty: BotDifficulty): Player[] {
  return [
    { id: "human", name: "Sen", type: "human", hand: [], completedSets: [] },
    {
      id: "bot-1",
      name: "Bot 1",
      type: "bot",
      hand: [],
      completedSets: [],
      botDifficulty: difficulty,
    },
    {
      id: "bot-2",
      name: "Bot 2",
      type: "bot",
      hand: [],
      completedSets: [],
      botDifficulty: difficulty,
    },
    {
      id: "bot-3",
      name: "Bot 3",
      type: "bot",
      hand: [],
      completedSets: [],
      botDifficulty: difficulty,
    },
  ];
}

export interface SessionStats {
  successfulRequests: number;
  failedRequests: number;
  sukranForgotten: number;
}

const INITIAL_SESSION_STATS: SessionStats = {
  successfulRequests: 0,
  failedRequests: 0,
  sukranForgotten: 0,
};

const INITIAL_STATE: GameState = {
  players: [],
  currentPlayerId: "",
  phase: "setup",
  lastMove: undefined,
  sukranTargetPlayerId: undefined,
  turnNumber: 1,
  winnerIds: [],
  // Placeholders only — startGame always overwrites these from the room's
  // tier (and the host's adjustments) before the game actually begins.
  sukranTimeoutMs: 2000,
  requestTimeoutMs: 8000,
  requestWarningMs: 4000,
  system: "points",
  stake: 0,
};

export interface CompletedSetAnnouncement {
  playerName: string;
  rank: Rank;
}

export interface StartGameOptions {
  difficulty: BotDifficulty;
  sukranTimeoutMs: number;
  requestTimeoutMs: number;
  requestWarningMs: number;
  system: CurrencySystem;
  stake: number;
}

export interface GameStore extends GameState {
  sessionStats: SessionStats;
  pendingAnnouncement: string | null;
  completedSetAnnouncement: CompletedSetAnnouncement | null;
  // Whoever's action handed the turn to currentPlayerId — a failed request, a
  // forgotten Şükran, or a forfeited turn all point back here. Used so a
  // forfeit sends the turn back to that same player, not a fixed seat order.
  previousPlayerId: string | null;
  startGame: (options: StartGameOptions) => void;
  // Re-deals with the exact same table config (difficulty, timeouts) as the
  // game that just ended — for "Play Again", which has no room/tier context.
  restartSameTable: () => void;
  beginPlay: () => void;
  resetGame: () => void;
  submitCardRequest: (request: CardRequest) => void;
  confirmSukran: () => void;
  handleSukranTimeout: () => void;
  forfeitCurrentRequest: () => void;
  runBotTurn: () => Promise<void>;
  completeGame: () => void;
  dismissCompletedSetAnnouncement: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,
  sessionStats: INITIAL_SESSION_STATS,
  pendingAnnouncement: null,
  completedSetAnnouncement: null,
  previousPlayerId: null,

  startGame: (options) => {
    const players = createInitialPlayers(options.difficulty);
    const deck = shuffleDeck(createDeck());
    const dealt = dealCards(deck, players);
    // Whoever holds the 2 of clubs (Sinek 2) deals first, per house rule —
    // not always the human. The UI holds on "dealing" for a beat before
    // handing off to that player.
    const starter =
      dealt.find((p) => p.hand.some((card) => card.rank === "2" && card.suit === "clubs")) ??
      dealt[0];
    set({
      players: dealt,
      currentPlayerId: starter.id,
      phase: "dealing",
      lastMove: undefined,
      sukranTargetPlayerId: undefined,
      turnNumber: 1,
      winnerIds: [],
      sukranTimeoutMs: options.sukranTimeoutMs,
      requestTimeoutMs: options.requestTimeoutMs,
      requestWarningMs: options.requestWarningMs,
      system: options.system,
      stake: options.stake,
      sessionStats: INITIAL_SESSION_STATS,
      pendingAnnouncement: null,
      completedSetAnnouncement: null,
      previousPlayerId: null,
    });
  },

  restartSameTable: () => {
    const state = get();
    const bot = state.players.find((p) => p.type === "bot" && p.botDifficulty);
    get().startGame({
      difficulty: bot?.botDifficulty ?? "normal",
      sukranTimeoutMs: state.sukranTimeoutMs,
      requestTimeoutMs: state.requestTimeoutMs,
      requestWarningMs: state.requestWarningMs,
      system: state.system,
      stake: state.stake,
    });
  },

  beginPlay: () => {
    const state = get();
    if (state.phase !== "dealing") {
      return;
    }
    set({ phase: "waiting_for_request" });
  },

  resetGame: () => {
    set({
      ...INITIAL_STATE,
      sessionStats: INITIAL_SESSION_STATS,
      pendingAnnouncement: null,
      completedSetAnnouncement: null,
      previousPlayerId: null,
    });
  },

  submitCardRequest: (request) => {
    const state = get();
    if (state.phase !== "waiting_for_request" || state.currentPlayerId !== request.requesterId) {
      return;
    }
    const previousRequester = state.players.find((p) => p.id === request.requesterId);
    const nextState = requestCards(state, request);
    const succeeded = nextState.lastMove?.success ?? false;
    const newRequester = nextState.players.find((p) => p.id === request.requesterId);
    const newlyCompletedRank = newRequester?.completedSets.find(
      (rank) => !previousRequester?.completedSets.includes(rank)
    );

    set({
      ...nextState,
      turnNumber: state.turnNumber + 1,
      // On a failed ("Yok") request, the target inherits the turn from the
      // requester whose request just failed — remember that hand-off so a
      // later forfeit on the target's own turn can ping it back to them.
      // A successful request keeps the same player on turn, so the previous
      // hand-off (if any) is left untouched.
      previousPlayerId: succeeded ? state.previousPlayerId : request.requesterId,
      sessionStats: {
        ...state.sessionStats,
        successfulRequests: state.sessionStats.successfulRequests + (succeeded ? 1 : 0),
        failedRequests: state.sessionStats.failedRequests + (succeeded ? 0 : 1),
      },
      completedSetAnnouncement: newlyCompletedRank
        ? { playerName: newRequester!.name, rank: newlyCompletedRank }
        : state.completedSetAnnouncement,
    });
  },

  dismissCompletedSetAnnouncement: () => {
    set({ completedSetAnnouncement: null });
  },

  // Player ran out of time to submit a card request: they forfeit the turn.
  // It pings back to whoever actually handed them the turn (previousPlayerId)
  // — not a fixed seat order — and that forfeiting player becomes the new
  // "previous", so a further forfeit would ping it right back again.
  forfeitCurrentRequest: () => {
    const state = get();
    if (state.phase !== "waiting_for_request") {
      return;
    }
    const forfeitedPlayer = state.players.find((p) => p.id === state.currentPlayerId);
    if (!forfeitedPlayer) {
      return;
    }
    let nextPlayerId = state.previousPlayerId;
    if (!nextPlayerId || nextPlayerId === forfeitedPlayer.id) {
      // No real hand-off happened yet (e.g. the very first turn of the game)
      // — fall back to the previous seat so the turn always has somewhere to go.
      const currentIndex = state.players.findIndex((p) => p.id === forfeitedPlayer.id);
      nextPlayerId =
        state.players[(currentIndex - 1 + state.players.length) % state.players.length].id;
    }
    const nextPlayer = state.players.find((p) => p.id === nextPlayerId)!;
    set({
      currentPlayerId: nextPlayer.id,
      previousPlayerId: forfeitedPlayer.id,
      turnNumber: state.turnNumber + 1,
      pendingAnnouncement: `${emphasize(forfeitedPlayer.name)} süresinde kart istemedi, sıra ${emphasize(withDative(nextPlayer.name))} geçti.`,
      sessionStats: {
        ...state.sessionStats,
        failedRequests: state.sessionStats.failedRequests + 1,
      },
    });
  },

  confirmSukran: () => {
    const state = get();
    if (state.phase !== "waiting_for_sukran") {
      return;
    }
    set(confirmSukranPure(state));
  },

  handleSukranTimeout: () => {
    const state = get();
    if (state.phase !== "waiting_for_sukran") {
      return;
    }
    set({
      ...handleSukranTimeoutPure(state),
      // The player who forgot Şükran is who the card-giver (the new current
      // player) inherited the turn from.
      previousPlayerId: state.currentPlayerId,
      sessionStats: {
        ...state.sessionStats,
        sukranForgotten: state.sessionStats.sukranForgotten + 1,
      },
    });
  },

  runBotTurn: async () => {
    const state = get();
    const bot = state.players.find((p) => p.id === state.currentPlayerId);
    if (state.phase !== "waiting_for_request" || !bot || bot.type !== "bot" || !bot.botDifficulty) {
      return;
    }
    const botDifficulty = bot.botDifficulty;

    await botThinkingDelay();

    const decision = chooseBotMove(get(), bot.id, botDifficulty);
    const target = get().players.find((p) => p.id === decision.targetPlayerId);
    set({
      pendingAnnouncement: `${emphasize(bot.name)}, ${emphasize(withAblative(target?.name ?? "?"))} ${emphasize(`${decision.amount} ${RANK_LABELS[decision.rank]}`)} istiyor…`,
    });

    await botAnnounceDelay();

    set({ pendingAnnouncement: null });
    get().submitCardRequest({
      requesterId: bot.id,
      targetPlayerId: decision.targetPlayerId,
      rank: decision.rank,
      amount: decision.amount,
    });

    if (get().phase !== "waiting_for_sukran") {
      return;
    }

    await botThinkingDelay();

    if (shouldBotForgetSukran(botDifficulty)) {
      get().handleSukranTimeout();
    } else {
      get().confirmSukran();
    }
  },

  completeGame: () => {
    const state = get();
    if (!checkGameOver(state)) {
      return;
    }
    set({ phase: "game_over", winnerIds: calculateWinners(state) });
  },
}));
