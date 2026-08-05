import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CurrencyIcon } from "../src/components/CurrencyIcon";
import { GradientBackground } from "../src/components/GradientBackground";
import {
  CURRENCY_INFO,
  TIERS,
  TIER_BOT_DIFFICULTY,
  type CurrencySystem,
  type TierId,
} from "../src/constants/lobby";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useGameStore } from "../src/store/game-store";

const TABLE_COUNT = 4;
const MODES = ["Rastgele", "Dengeli", "Dengeli", "Rastgele"];

export default function RoomsScreen() {
  const params = useLocalSearchParams<{ system?: string; tier?: string }>();
  const startGame = useGameStore((state) => state.startGame);

  const system = (params.system as CurrencySystem) ?? "points";
  const tierId = (params.tier as TierId) ?? "newbie";
  const tier = TIERS.find((t) => t.id === tierId) ?? TIERS[0];
  const difficulty = TIER_BOT_DIFFICULTY[tierId];
  const currency = CURRENCY_INFO[system];

  function join() {
    startGame(difficulty);
    router.replace("/game");
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <View style={styles.headerTitleRow}>
            <CurrencyIcon system={system} size={28} />
            <View>
              <Text style={styles.headerTitle}>{tier.label}</Text>
              <Text style={styles.headerSubtitle}>{currency.name} salonları</Text>
            </View>
          </View>
          <Pressable style={styles.quickPlayButton} onPress={join}>
            <Text style={styles.quickPlayText}>HEMEN OYNA</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.tableGrid}>
          {Array.from({ length: TABLE_COUNT }, (_, index) => (
            <Pressable key={index} style={styles.tableCard} onPress={join}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableNumber}>Masa {index + 1}</Text>
                <Text style={styles.tableMode}>{MODES[index % MODES.length]}</Text>
              </View>

              <View style={styles.seatsRow}>
                <Seat label="Sen" empty />
                <Seat label="Bot 1" />
                <Seat label="Bot 2" />
                <Seat label="Bot 3" />
              </View>

              <View style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Katıl</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

function Seat({ label, empty }: { label: string; empty?: boolean }) {
  return (
    <View style={styles.seat}>
      <View style={[styles.seatAvatar, empty && styles.seatAvatarEmpty]}>
        <Text style={styles.seatAvatarText}>{empty ? "OYNA" : "BOT"}</Text>
      </View>
      <Text style={styles.seatLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: "700",
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 22,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  quickPlayButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  quickPlayText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 15,
  },
  tableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  tableCard: {
    width: 300,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableNumber: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 17,
  },
  tableMode: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  seatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seat: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  seatAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.slate,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  seatAvatarEmpty: {
    borderColor: COLORS.mint,
    borderStyle: "dashed",
  },
  seatAvatarText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
  },
  seatLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  joinButton: {
    backgroundColor: "rgba(212, 175, 55, 0.14)",
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    alignItems: "center",
  },
  joinButtonText: {
    color: COLORS.goldBright,
    fontFamily: FONTS.headingBold,
    fontSize: 15,
  },
});
