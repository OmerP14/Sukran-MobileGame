import type { GameState } from "../types/game";

export function getNextTurnAfterFailedRequest(targetPlayerId: string): string {
  return targetPlayerId;
}

export function confirmSukran(state: GameState): GameState {
  if (state.phase !== "waiting_for_sukran" || !state.lastMove) {
    return state;
  }
  return {
    ...state,
    phase: "waiting_for_request",
    sukranTargetPlayerId: undefined,
    lastMove: { ...state.lastMove, forgotSukran: false },
  };
}

export function handleSukranTimeout(state: GameState): GameState {
  if (state.phase !== "waiting_for_sukran" || !state.lastMove || !state.sukranTargetPlayerId) {
    return state;
  }
  return {
    ...state,
    phase: "waiting_for_request",
    currentPlayerId: getNextTurnAfterFailedRequest(state.sukranTargetPlayerId),
    sukranTargetPlayerId: undefined,
    lastMove: { ...state.lastMove, forgotSukran: true },
  };
}
