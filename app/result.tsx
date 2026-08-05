import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useGameStore } from "../src/store/game-store";
import { useSettingsStore } from "../src/store/settings-store";

export default function ResultScreen() {
  const players = useGameStore((state) => state.players);
  const winnerIds = useGameStore((state) => state.winnerIds);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const sessionStats = useGameStore((state) => state.sessionStats);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const botDifficulty = useSettingsStore((state) => state.settings.botDifficulty);

  const ranking = [...players].sort((a, b) => b.completedSets.length - a.completedSets.length);
  const winnerNames = players.filter((p) => winnerIds.includes(p.id)).map((p) => p.name);

  function handlePlayAgain() {
    startGame(botDifficulty);
    router.replace("/game");
  }

  function handleMainMenu() {
    resetGame();
    router.replace("/lobby");
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.winnerLabel}>{winnerNames.length > 1 ? "Kazananlar" : "Kazanan"}</Text>
        <Text style={styles.winnerName}>{winnerNames.join(", ")}</Text>

        <View style={styles.rankingBlock}>
          {ranking.map((player, index) => (
            <View key={player.id} style={styles.rankingRow}>
              <Text style={styles.rankingPosition}>{index + 1}.</Text>
              <Text style={styles.rankingName}>{player.name}</Text>
              <Text style={styles.rankingSets}>{player.completedSets.length} dörtlü</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <StatTile label="Toplam Hamle" value={String(turnNumber)} />
          <StatTile label="Başarılı İstek" value={String(sessionStats.successfulRequests)} />
          <StatTile label="Başarısız İstek" value={String(sessionStats.failedRequests)} />
          <StatTile label="Şükran Unutma" value={String(sessionStats.sukranForgotten)} />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handlePlayAgain}>
          <Text style={styles.buttonTextPrimary}>Yeniden Oyna</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleMainMenu}>
          <Text style={styles.buttonText}>Lobiye Dön</Text>
        </Pressable>
      </View>
    </GradientBackground>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.lg,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  winnerLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: SPACING.lg,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  winnerName: {
    color: COLORS.goldBright,
    fontFamily: FONTS.display,
    fontSize: 32,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  rankingBlock: {
    width: "100%",
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  rankingPosition: {
    color: COLORS.gold,
    fontFamily: FONTS.headingBold,
    width: 20,
  },
  rankingName: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 15,
  },
  rankingSets: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    justifyContent: "space-between",
  },
  statTile: {
    width: "47%",
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    paddingVertical: SPACING.md,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: COLORS.goldBright,
    fontFamily: FONTS.headingBold,
    fontSize: 18,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  actions: {
    padding: SPACING.lg,
    gap: SPACING.sm,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  button: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: COLORS.gold,
  },
  buttonText: {
    color: COLORS.cream,
    fontFamily: FONTS.heading,
    fontSize: 14,
  },
  buttonTextPrimary: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 14,
  },
});
