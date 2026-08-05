import {
  confirmSukran,
  getNextTurnAfterFailedRequest,
  handleSukranTimeout,
} from "../src/game/turn";
import { makePlayer, makeState } from "./helpers";

function makeWaitingForSukranState() {
  return makeState({
    currentPlayerId: "p1",
    phase: "waiting_for_sukran",
    sukranTargetPlayerId: "p2",
    players: [makePlayer({ id: "p1" }), makePlayer({ id: "p2" })],
    lastMove: {
      requesterId: "p1",
      targetPlayerId: "p2",
      rank: "A",
      requestedAmount: 1,
      success: true,
      transferredAmount: 1,
    },
  });
}

describe("getNextTurnAfterFailedRequest", () => {
  it("returns the target player as the next turn holder", () => {
    expect(getNextTurnAfterFailedRequest("p2")).toBe("p2");
  });
});

describe("confirmSukran", () => {
  it("keeps the same player's turn when Sukran is said in time", () => {
    const state = makeWaitingForSukranState();

    const result = confirmSukran(state);

    expect(result.currentPlayerId).toBe("p1");
    expect(result.phase).toBe("waiting_for_request");
    expect(result.lastMove?.forgotSukran).toBe(false);
  });
});

describe("handleSukranTimeout", () => {
  it("passes the turn to the player the cards were taken from when Sukran is forgotten", () => {
    const state = makeWaitingForSukranState();

    const result = handleSukranTimeout(state);

    expect(result.currentPlayerId).toBe("p2");
    expect(result.phase).toBe("waiting_for_request");
    expect(result.lastMove?.forgotSukran).toBe(true);
  });
});
