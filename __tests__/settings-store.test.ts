import { useSettingsStore, winRate } from "../src/store/settings-store";

describe("useSettingsStore", () => {
  it("exposes sensible defaults before hydration", () => {
    const state = useSettingsStore.getState();
    expect(state.settings.botDifficulty).toBe("normal");
    expect(state.settings.soundEnabled).toBe(true);
    expect(winRate(state.statistics)).toBe(0);
  });

  it("persists updated settings and reflects them in state", async () => {
    await useSettingsStore
      .getState()
      .updateSettings({ soundEnabled: false, botDifficulty: "hard" });

    const state = useSettingsStore.getState();
    expect(state.settings.soundEnabled).toBe(false);
    expect(state.settings.botDifficulty).toBe("hard");
  });

  it("accumulates statistics across recorded games", async () => {
    const before = useSettingsStore.getState().statistics.gamesPlayed;

    await useSettingsStore.getState().recordGameResult({
      won: true,
      completedSets: 5,
      successfulRequests: 10,
      failedRequests: 4,
      sukranForgotten: 1,
    });

    const state = useSettingsStore.getState();
    expect(state.statistics.gamesPlayed).toBe(before + 1);
    expect(state.statistics.gamesWon).toBeGreaterThanOrEqual(1);
    expect(winRate(state.statistics)).toBeGreaterThan(0);
  });
});
