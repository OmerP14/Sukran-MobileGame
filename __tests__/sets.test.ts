import { findCompletedSets, removeCompletedSets } from "../src/game/sets";
import { makeCards, makePlayer } from "./helpers";

describe("findCompletedSets", () => {
  it("detects a rank with 4 cards in hand", () => {
    const hand = [...makeCards("K", 4), ...makeCards("A", 2)];
    expect(findCompletedSets(hand)).toEqual(["K"]);
  });

  it("finds nothing when no rank has 4 cards", () => {
    const hand = [...makeCards("K", 3), ...makeCards("A", 2)];
    expect(findCompletedSets(hand)).toEqual([]);
  });
});

describe("removeCompletedSets", () => {
  it("automatically closes a completed quad and removes it from the hand", () => {
    const player = makePlayer({
      id: "p1",
      hand: [...makeCards("K", 4), ...makeCards("A", 2)],
    });

    const updated = removeCompletedSets(player);

    expect(updated.completedSets).toEqual(["K"]);
    expect(updated.hand).toHaveLength(2);
    expect(updated.hand.every((card) => card.rank !== "K")).toBe(true);
  });

  it("does not close the same rank twice", () => {
    const player = makePlayer({
      id: "p1",
      hand: makeCards("A", 2),
      completedSets: ["K"],
    });

    const updated = removeCompletedSets(player);

    expect(updated.completedSets).toEqual(["K"]);
  });
});
