import type { CardRequest, GameState } from "../types/game";
import { calculateWinners, checkGameOver } from "./game-over";
import { countCardsOfRank, getPlayerById, replacePlayer } from "./rules";
import { removeCompletedSets } from "./sets";
import { getNextTurnAfterFailedRequest } from "./turn";

export function requestCards(state: GameState, request: CardRequest): GameState {
  if (request.requesterId === request.targetPlayerId) {
    throw new Error("A player cannot request cards from themselves.");
  }
  if (request.amount < 1 || request.amount > 4) {
    throw new Error("Requested amount must be between 1 and 4.");
  }
  getPlayerById(state, request.requesterId);
  getPlayerById(state, request.targetPlayerId);

  return resolveCardRequest(state, request);
}

export function resolveCardRequest(state: GameState, request: CardRequest): GameState {
  const requester = getPlayerById(state, request.requesterId);
  const target = getPlayerById(state, request.targetPlayerId);
  const availableCount = countCardsOfRank(target.hand, request.rank);

  if (availableCount < request.amount) {
    return {
      ...state,
      phase: "waiting_for_request",
      currentPlayerId: getNextTurnAfterFailedRequest(request.targetPlayerId),
      lastMove: {
        requesterId: request.requesterId,
        targetPlayerId: request.targetPlayerId,
        rank: request.rank,
        requestedAmount: request.amount,
        success: false,
        transferredAmount: 0,
      },
    };
  }

  const transferredCards = target.hand
    .filter((card) => card.rank === request.rank)
    .slice(0, request.amount);
  const transferredIds = new Set(transferredCards.map((card) => card.id));

  const updatedTarget = {
    ...target,
    hand: target.hand.filter((card) => !transferredIds.has(card.id)),
  };
  const updatedRequester = removeCompletedSets({
    ...requester,
    hand: [...requester.hand, ...transferredCards],
  });

  let nextState = replacePlayer(state, updatedTarget);
  nextState = replacePlayer(nextState, updatedRequester);

  nextState = {
    ...nextState,
    lastMove: {
      requesterId: request.requesterId,
      targetPlayerId: request.targetPlayerId,
      rank: request.rank,
      requestedAmount: request.amount,
      success: true,
      transferredAmount: transferredCards.length,
    },
  };

  if (checkGameOver(nextState)) {
    return {
      ...nextState,
      phase: "game_over",
      winnerIds: calculateWinners(nextState),
    };
  }

  return {
    ...nextState,
    phase: "waiting_for_sukran",
    sukranTargetPlayerId: request.targetPlayerId,
  };
}
