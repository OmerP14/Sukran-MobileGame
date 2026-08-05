import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useSettingsStore, winRate } from "../src/store/settings-store";

export default function StatisticsScreen() {
  const statistics = useSettingsStore((state) => state.statistics);
  const rate = winRate(statistics);

  const tiles: { label: string; value: string }[] = [
    { label: "Oynanan Oyun", value: String(statistics.gamesPlayed) },
    { label: "Galibiyet", value: String(statistics.gamesWon) },
    { label: "Galibiyet Oranı", value: `%${Math.round(rate * 100)}` },
    { label: "Toplam Dörtlü", value: String(statistics.totalCompletedSets) },
    { label: "Başarılı İstek", value: String(statistics.successfulRequests) },
    { label: "Başarısız İstek", value: String(statistics.failedRequests) },
    { label: "Şükran Unutma", value: String(statistics.sukranForgotten) },
    { label: "En İyi Skor", value: String(statistics.bestGameScore) },
  ];

  return (
    <GradientBackground edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <View key={tile.label} style={styles.tile}>
              <Text style={styles.value}>{tile.value}</Text>
              <Text style={styles.label}>{tile.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    justifyContent: "space-between",
  },
  tile: {
    width: "47%",
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    gap: 4,
  },
  value: {
    color: COLORS.goldBright,
    fontFamily: FONTS.headingBold,
    fontSize: 22,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
