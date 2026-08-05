import { RANKS } from "../constants/cards";
import { BOT_FORGET_SUKRAN_PROBABILITY } from "../constants/config";
import type { BotDifficulty, GameState, Player, Rank } from "../types/game";
import { getPlayerById } from "./rules";
import { pickRandom, randomAmount, randomChance } from "../utils/random";

export interface BotDecision {
  targetPlayerId: string;
  rank: Rank;
  amount: 1 | 2 | 3 | 4;
}

function countByRank(hand: Player["hand"]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of hand) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  return counts;
}

function ranksByOwnCount(handCounts: Map<Rank, number>, minCount: number): Rank[] {
  return [...handCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([rank]) => rank);
}

// Capped at 3: requesting all 4 of a rank in one go is disabled game-wide.
function clampAmount(amount: number): 1 | 2 | 3 | 4 {
  return Math.min(3, Math.max(1, amount)) as 1 | 2 | 3 | 4;
}

function recentSuccessCandidate(
  state: GameState,
  botPlayerId: string,
  opponents: Player[]
): BotDecision | undefined {
  const lastMove = state.lastMove;
  if (!lastMove || !lastMove.success) {
    return undefined;
  }
  if (lastMove.requesterId === botPlayerId) {
    return undefined;
  }
  const candidate = opponents.find((p) => p.id === lastMove.requesterId);
  if (!candidate) {
    return undefined;
  }
  return {
    targetPlayerId: candidate.id,
    rank: lastMove.rank,
    amount: clampAmount(lastMove.transferredAmount),
  };
}

function randomDecision(opponents: Player[]): BotDecision {
  return {
    targetPlayerId: pickRandom(opponents).id,
    rank: pickRandom(RANKS),
    amount: randomAmount(),
  };
}

function chooseEasyMove(state: GameState, botPlayerId: string, opponents: Player[]): BotDecision {
  if (randomChance(0.2)) {
    const memoryMove = recentSuccessCandidate(state, botPlayerId, opponents);
    if (memoryMove) {
      return memoryMove;
    }
  }
  return randomDecision(opponents);
}

function chooseNormalMove(
  state: GameState,
  botPlayerId: string,
  bot: Player,
  opponents: Player[]
): BotDecision {
  if (randomChance(0.5)) {
    const memoryMove = recentSuccessCandidate(state, botPlayerId, opponents);
    if (memoryMove) {
      return memoryMove;
    }
  }

  const priorityRanks = ranksByOwnCount(countByRank(bot.hand), 2);
  if (priorityRanks.length > 0) {
    const rank = priorityRanks[0];
    const ownCount = bot.hand.filter((card) => card.rank === rank).length;
    return {
      targetPlayerId: pickRandom(opponents).id,
      rank,
      amount: clampAmount(4 - ownCount),
    };
  }

  return randomDecision(opponents);
}

function chooseHardMove(
  state: GameState,
  botPlayerId: string,
  bot: Player,
  opponents: Player[]
): BotDecision {
  const memoryMove = recentSuccessCandidate(state, botPlayerId, opponents);
  if (memoryMove) {
    return memoryMove;
  }

  const priorityRanks = ranksByOwnCount(countByRank(bot.hand), 2);
  if (priorityRanks.length > 0) {
    const rank = priorityRanks[0];
    const ownCount = bot.hand.filter((card) => card.rank === rank).length;
    return {
      targetPlayerId: pickRandom(opponents).id,
      rank,
      amount: clampAmount(4 - ownCount),
    };
  }

  return randomDecision(opponents);
}

export function chooseBotMove(
  state: GameState,
  botPlayerId: string,
  difficulty: BotDifficulty
): BotDecision {
  const bot = getPlayerById(state, botPlayerId);
  // A player with an empty hand has nothing to give, so they're never a
  // valid target — regardless of who's asking or how many cards they hold.
  const opponents = state.players.filter(
    (player) => player.id !== botPlayerId && player.hand.length > 0
  );
  if (opponents.length === 0) {
    throw new Error("A bot needs at least one opponent to request cards from.");
  }

  switch (difficulty) {
    case "easy":
      return chooseEasyMove(state, botPlayerId, opponents);
    case "normal":
      return chooseNormalMove(state, botPlayerId, bot, opponents);
    case "hard":
      return chooseHardMove(state, botPlayerId, bot, opponents);
  }
}

export function shouldBotForgetSukran(difficulty: BotDifficulty): boolean {
  return randomChance(BOT_FORGET_SUKRAN_PROBABILITY[difficulty]);
}
