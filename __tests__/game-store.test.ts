import { useGameStore } from "../src/store/game-store";
import { makeCards, makePlayer } from "./helpers";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("deals 13 cards to each of the 4 players on startGame", () => {
    useGameStore.getState().startGame("easy");
    const state = useGameStore.getState();

    expect(state.players).toHaveLength(4);
    for (const player of state.players) {
      expect(player.hand).toHaveLength(13);
    }
    expect(state.phase).toBe("dealing");
  });

  it("starts play with whoever holds the 2 of clubs once dealing finishes", () => {
    useGameStore.getState().startGame("easy");
    const dealt = useGameStore.getState();
    const starter = dealt.players.find((p) =>
      p.hand.some((card) => card.rank === "2" && card.suit === "clubs")
    );
    expect(starter).toBeDefined();
    expect(dealt.currentPlayerId).toBe(starter!.id);

    useGameStore.getState().beginPlay();

    const state = useGameStore.getState();
    expect(state.phase).toBe("waiting_for_request");
    expect(state.currentPlayerId).toBe(starter!.id);
  });

  it("ignores beginPlay outside of the dealing phase", () => {
    useGameStore.setState({
      players: [makePlayer({ id: "human" })],
      currentPlayerId: "human",
      phase: "waiting_for_request",
      turnNumber: 1,
      winnerIds: [],
    });

    useGameStore.getState().beginPlay();

    expect(useGameStore.getState().phase).toBe("waiting_for_request");
  });

  it("coordinates a successful request into the waiting_for_sukran phase", () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human", hand: [] }),
        makePlayer({ id: "bot-1", type: "bot", botDifficulty: "easy", hand: makeCards("Q", 2) }),
      ],
      currentPlayerId: "human",
      phase: "waiting_for_request",
      turnNumber: 1,
      winnerIds: [],
    });

    useGameStore.getState().submitCardRequest({
      requesterId: "human",
      targetPlayerId: "bot-1",
      rank: "Q",
      amount: 2,
    });

    const state = useGameStore.getState();
    expect(state.phase).toBe("waiting_for_sukran");
    expect(state.players.find((p) => p.id === "human")?.hand).toHaveLength(2);
  });

  it("ignores a request submitted out of turn", () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human", hand: [] }),
        makePlayer({ id: "bot-1", type: "bot", hand: makeCards("Q", 2) }),
      ],
      currentPlayerId: "bot-1",
      phase: "waiting_for_request",
      turnNumber: 1,
      winnerIds: [],
    });

    useGameStore.getState().submitCardRequest({
      requesterId: "human",
      targetPlayerId: "bot-1",
      rank: "Q",
      amount: 2,
    });

    expect(useGameStore.getState().currentPlayerId).toBe("bot-1");
  });

  it("resumes the requester's turn after confirmSukran", () => {
    useGameStore.setState({
      players: [makePlayer({ id: "human" }), makePlayer({ id: "bot-1", type: "bot" })],
      currentPlayerId: "human",
      phase: "waiting_for_sukran",
      sukranTargetPlayerId: "bot-1",
      turnNumber: 2,
      winnerIds: [],
      lastMove: {
        requesterId: "human",
        targetPlayerId: "bot-1",
        rank: "Q",
        requestedAmount: 2,
        success: true,
        transferredAmount: 2,
      },
    });

    useGameStore.getState().confirmSukran();

    const state = useGameStore.getState();
    expect(state.phase).toBe("waiting_for_request");
    expect(state.currentPlayerId).toBe("human");
  });

  it("passes the turn to the target after a Sukran timeout", () => {
    useGameStore.setState({
      players: [makePlayer({ id: "human" }), makePlayer({ id: "bot-1", type: "bot" })],
      currentPlayerId: "human",
      phase: "waiting_for_sukran",
      sukranTargetPlayerId: "bot-1",
      turnNumber: 2,
      winnerIds: [],
      lastMove: {
        requesterId: "human",
        targetPlayerId: "bot-1",
        rank: "Q",
        requestedAmount: 2,
        success: true,
        transferredAmount: 2,
      },
    });

    useGameStore.getState().handleSukranTimeout();

    const state = useGameStore.getState();
    expect(state.phase).toBe("waiting_for_request");
    expect(state.currentPlayerId).toBe("bot-1");
  });

  it("remembers who a failed request handed the turn to", () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human", hand: [] }),
        makePlayer({ id: "bot-2", type: "bot", hand: makeCards("A", 1) }),
      ],
      currentPlayerId: "bot-2",
      phase: "waiting_for_request",
      turnNumber: 3,
      winnerIds: [],
    });

    useGameStore.getState().submitCardRequest({
      requesterId: "bot-2",
      targetPlayerId: "human",
      rank: "A",
      amount: 2,
    });

    const state = useGameStore.getState();
    expect(state.currentPlayerId).toBe("human");
    expect(state.previousPlayerId).toBe("bot-2");
  });

  it("forfeits the turn back to whoever actually handed it over, not a fixed seat", () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human" }),
        makePlayer({ id: "bot-1", type: "bot" }),
        makePlayer({ id: "bot-2", type: "bot" }),
        makePlayer({ id: "bot-3", type: "bot" }),
      ],
      currentPlayerId: "human",
      previousPlayerId: "bot-2",
      phase: "waiting_for_request",
      turnNumber: 5,
      winnerIds: [],
    });

    useGameStore.getState().forfeitCurrentRequest();

    const state = useGameStore.getState();
    expect(state.phase).toBe("waiting_for_request");
    expect(state.currentPlayerId).toBe("bot-2");
    expect(state.previousPlayerId).toBe("human");
    expect(state.turnNumber).toBe(6);
    expect(state.sessionStats.failedRequests).toBe(1);
  });

  it("falls back to the previous seat when there is no tracked hand-off yet", () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human" }),
        makePlayer({ id: "bot-1", type: "bot" }),
        makePlayer({ id: "bot-2", type: "bot" }),
        makePlayer({ id: "bot-3", type: "bot" }),
      ],
      currentPlayerId: "human",
      previousPlayerId: null,
      phase: "waiting_for_request",
      turnNumber: 1,
      winnerIds: [],
    });

    useGameStore.getState().forfeitCurrentRequest();

    expect(useGameStore.getState().currentPlayerId).toBe("bot-3");
  });

  it("runs a full bot turn end-to-end", async () => {
    useGameStore.setState({
      players: [
        makePlayer({ id: "human", hand: makeCards("A", 1) }),
        makePlayer({
          id: "bot-1",
          type: "bot",
          botDifficulty: "easy",
          hand: makeCards("K", 2),
        }),
      ],
      currentPlayerId: "bot-1",
      phase: "waiting_for_request",
      turnNumber: 1,
      winnerIds: [],
    });

    await useGameStore.getState().runBotTurn();

    const state = useGameStore.getState();
    expect(["waiting_for_request", "waiting_for_sukran", "game_over"]).toContain(state.phase);
  }, 20000);
});
