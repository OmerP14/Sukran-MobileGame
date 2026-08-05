import { RANKS } from "../src/constants/cards";
import { chooseBotMove, shouldBotForgetSukran } from "../src/game/bot-ai";
import type { BotDifficulty } from "../src/types/game";
import { makeCards, makePlayer, makeState } from "./helpers";

const DIFFICULTIES: BotDifficulty[] = ["easy", "normal", "hard"];

function makeFourPlayerState() {
  return makeState({
    currentPlayerId: "bot1",
    players: [
      makePlayer({ id: "bot1", type: "bot", botDifficulty: "easy", hand: makeCards("Q", 2) }),
      makePlayer({ id: "human", hand: makeCards("A", 3) }),
      makePlayer({ id: "bot2", type: "bot", botDifficulty: "normal", hand: makeCards("K", 1) }),
      makePlayer({ id: "bot3", type: "bot", botDifficulty: "hard", hand: makeCards("10", 1) }),
    ],
    lastMove: {
      requesterId: "human",
      targetPlayerId: "bot2",
      rank: "A",
      requestedAmount: 2,
      success: true,
      transferredAmount: 2,
    },
  });
}

describe("chooseBotMove", () => {
  it.each(DIFFICULTIES)("always picks a valid target, rank and amount (%s)", (difficulty) => {
    const state = makeFourPlayerState();

    for (let i = 0; i < 50; i++) {
      const decision = chooseBotMove(state, "bot1", difficulty);

      expect(decision.targetPlayerId).not.toBe("bot1");
      expect(state.players.some((p) => p.id === decision.targetPlayerId)).toBe(true);
      expect(RANKS).toContain(decision.rank);
      expect(decision.amount).toBeGreaterThanOrEqual(1);
      // Requesting all 4 of a rank in one go is disabled game-wide.
      expect(decision.amount).toBeLessThanOrEqual(3);
    }
  });

  it("throws when the bot has no opponents", () => {
    const state = makeState({ players: [makePlayer({ id: "bot1", type: "bot" })] });

    expect(() => chooseBotMove(state, "bot1", "easy")).toThrow();
  });
});

describe("shouldBotForgetSukran", () => {
  it("returns a boolean for every difficulty", () => {
    for (const difficulty of DIFFICULTIES) {
      expect(typeof shouldBotForgetSukran(difficulty)).toBe("boolean");
    }
  });
});
