import { createDeck, dealCards, shuffleDeck } from "../src/game/deck";
import { makePlayer } from "./helpers";

describe("createDeck", () => {
  it("produces 52 unique cards", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
  });
});

describe("shuffleDeck", () => {
  it("keeps the same 52 cards, only reordered", () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    expect(new Set(shuffled.map((card) => card.id))).toEqual(new Set(deck.map((card) => card.id)));
  });
});

describe("dealCards", () => {
  it("deals exactly 13 cards to each of the 4 players", () => {
    const deck = createDeck();
    const players = [
      makePlayer({ id: "p1" }),
      makePlayer({ id: "p2" }),
      makePlayer({ id: "p3" }),
      makePlayer({ id: "p4" }),
    ];
    const dealt = dealCards(deck, players);
    expect(dealt).toHaveLength(4);
    for (const player of dealt) {
      expect(player.hand).toHaveLength(13);
    }
    const allDealtIds = dealt.flatMap((player) => player.hand.map((card) => card.id));
    expect(new Set(allDealtIds).size).toBe(52);
  });
});
