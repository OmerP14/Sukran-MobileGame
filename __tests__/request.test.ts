import { requestCards } from "../src/game/request";
import { makeCards, makePlayer, makeState } from "./helpers";

describe("requestCards", () => {
  it("transfers exactly the requested amount on a successful request", () => {
    const state = makeState({
      currentPlayerId: "p1",
      players: [
        makePlayer({ id: "p1", hand: [] }),
        makePlayer({ id: "p2", hand: makeCards("Q", 3) }),
      ],
    });

    const result = requestCards(state, {
      requesterId: "p1",
      targetPlayerId: "p2",
      rank: "Q",
      amount: 2,
    });

    const requester = result.players.find((p) => p.id === "p1")!;
    const target = result.players.find((p) => p.id === "p2")!;

    expect(requester.hand).toHaveLength(2);
    expect(target.hand).toHaveLength(1);
    expect(result.lastMove).toMatchObject({ success: true, transferredAmount: 2 });
    expect(result.phase).toBe("waiting_for_sukran");
  });

  it("transfers nothing when the target has fewer cards than requested", () => {
    const state = makeState({
      currentPlayerId: "p1",
      players: [
        makePlayer({ id: "p1", hand: [] }),
        makePlayer({ id: "p2", hand: makeCards("Q", 1) }),
      ],
    });

    const result = requestCards(state, {
      requesterId: "p1",
      targetPlayerId: "p2",
      rank: "Q",
      amount: 2,
    });

    const requester = result.players.find((p) => p.id === "p1")!;
    const target = result.players.find((p) => p.id === "p2")!;

    expect(requester.hand).toHaveLength(0);
    expect(target.hand).toHaveLength(1);
    expect(result.lastMove).toMatchObject({ success: false, transferredAmount: 0 });
  });

  it("returns a 'Yok' (failed) result when 1 card is held but 2 are requested", () => {
    const state = makeState({
      currentPlayerId: "p1",
      players: [
        makePlayer({ id: "p1", hand: [] }),
        makePlayer({ id: "p2", hand: makeCards("A", 1) }),
      ],
    });

    const result = requestCards(state, {
      requesterId: "p1",
      targetPlayerId: "p2",
      rank: "A",
      amount: 2,
    });

    expect(result.lastMove?.success).toBe(false);
  });

  it("passes the turn to the target player after a failed request", () => {
    const state = makeState({
      currentPlayerId: "p1",
      players: [
        makePlayer({ id: "p1", hand: [] }),
        makePlayer({ id: "p2", hand: makeCards("A", 1) }),
      ],
    });

    const result = requestCards(state, {
      requesterId: "p1",
      targetPlayerId: "p2",
      rank: "A",
      amount: 2,
    });

    expect(result.currentPlayerId).toBe("p2");
    expect(result.phase).toBe("waiting_for_request");
  });

  it("rejects a request targeting oneself", () => {
    const state = makeState({
      players: [makePlayer({ id: "p1" })],
    });

    expect(() =>
      requestCards(state, { requesterId: "p1", targetPlayerId: "p1", rank: "A", amount: 1 })
    ).toThrow();
  });
});
