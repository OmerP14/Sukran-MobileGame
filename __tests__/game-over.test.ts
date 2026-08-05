import { RANKS } from "../src/constants/cards";
import { calculateWinners, checkGameOver } from "../src/game/game-over";
import { makePlayer, makeState } from "./helpers";
import type { Rank } from "../src/types/game";

describe("checkGameOver", () => {
  it("is not over while fewer than 13 sets are completed", () => {
    const state = makeState({
      players: [
        makePlayer({ id: "p1", completedSets: ["A", "K"] }),
        makePlayer({ id: "p2", completedSets: ["Q"] }),
      ],
    });

    expect(checkGameOver(state)).toBe(false);
  });

  it("ends once all 13 rank sets have been completed", () => {
    const allRanks = [...RANKS] as Rank[];
    const state = makeState({
      players: [
        makePlayer({ id: "p1", completedSets: allRanks.slice(0, 7) }),
        makePlayer({ id: "p2", completedSets: allRanks.slice(7) }),
      ],
    });

    expect(checkGameOver(state)).toBe(true);
  });
});

describe("calculateWinners", () => {
  it("declares the player with the most completed sets the winner", () => {
    const state = makeState({
      players: [
        makePlayer({ id: "p1", completedSets: ["A", "K", "Q"] }),
        makePlayer({ id: "p2", completedSets: ["J"] }),
      ],
    });

    expect(calculateWinners(state)).toEqual(["p1"]);
  });

  it("returns multiple winners when there is a tie", () => {
    const state = makeState({
      players: [
        makePlayer({ id: "p1", completedSets: ["A", "K"] }),
        makePlayer({ id: "p2", completedSets: ["Q", "J"] }),
        makePlayer({ id: "p3", completedSets: ["10"] }),
      ],
    });

    expect(calculateWinners(state).sort()).toEqual(["p1", "p2"]);
  });
});
