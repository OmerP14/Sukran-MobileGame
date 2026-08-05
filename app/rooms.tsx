import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { CurrencyIcon } from "../src/components/CurrencyIcon";
import { GradientBackground } from "../src/components/GradientBackground";
import { HostSettingsPanel } from "../src/components/HostSettingsPanel";
import { POINTS_ENTRY_FEE } from "../src/constants/config";
import {
  CURRENCY_INFO,
  TIER_BOT_DIFFICULTY,
  TIER_REQUEST_TIMEOUT_MS,
  TIER_REQUEST_WARNING_MS,
  TIER_STAKE,
  TIER_SUKRAN_TIMEOUT_MS,
  tiersForSystem,
  type CurrencySystem,
  type LokumTierId,
  type TierId,
} from "../src/constants/lobby";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useGameStore } from "../src/store/game-store";
import { useProfileStore } from "../src/store/profile-store";
import { playSound } from "../src/utils/sound";

const TABLE_COUNT = 9;
const MODES = ["Rastgele", "Dengeli", "Dengeli", "Rastgele"];
const VISIBLE_TABLES = 3;
const TABLE_GAP = SPACING.md;
const STAKE_STEP = 100;
const STAKE_MIN_FLOOR = 100;

export default function RoomsScreen() {
  const params = useLocalSearchParams<{ system?: string; tier?: string }>();
  const startGame = useGameStore((state) => state.startGame);
  const profile = useProfileStore((state) => state.profile);
  const spendCurrency = useProfileStore((state) => state.spendCurrency);
  const { width } = useWindowDimensions();

  const system = (params.system as CurrencySystem) ?? "points";
  const tiers = tiersForSystem(system);
  const tierId = (params.tier as TierId) ?? tiers[0].id;
  const tier = tiers.find((t) => t.id === tierId) ?? tiers[0];
  const currency = CURRENCY_INFO[system];

  const difficulty = TIER_BOT_DIFFICULTY[tierId];
  const sukranDefault = TIER_SUKRAN_TIMEOUT_MS[tierId];
  const requestDefault = TIER_REQUEST_TIMEOUT_MS[tierId];
  const warningWindowMs = TIER_REQUEST_WARNING_MS[tierId];

  // Lokum stake defaults to the room's round ceiling, but never above what
  // the host can actually afford right now (rounded down to the nearest
  // 100) — e.g. 3500 lokum in a 5000-ceiling room opens at 3500, not 5000.
  // Puanlı tables have no per-tier stake at all, just the flat entry fee.
  const balance = profile ? (system === "lokum" ? profile.lokum : profile.points) : 0;
  let stakeMin: number;
  let stakeMax: number;
  if (system === "lokum") {
    const tierCeiling = TIER_STAKE[tierId as LokumTierId];
    const affordable = Math.floor(balance / STAKE_STEP) * STAKE_STEP;
    stakeMax = Math.min(tierCeiling, Math.max(affordable, STAKE_MIN_FLOOR));
    stakeMin = STAKE_MIN_FLOOR;
  } else {
    stakeMin = POINTS_ENTRY_FEE;
    stakeMax = POINTS_ENTRY_FEE;
  }
  const defaultStake = stakeMax;

  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [stake, setStake] = useState(defaultStake);
  const [sukranTimeoutMs, setSukranTimeoutMs] = useState(sukranDefault);
  const [requestTimeoutMs, setRequestTimeoutMs] = useState(requestDefault);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const listWidth = width - SPACING.lg * 2;
  const tableWidth = (listWidth - TABLE_GAP * (VISIBLE_TABLES - 1)) / VISIBLE_TABLES;

  function openHostSetup() {
    playSound("uiTap");
    setStake(defaultStake);
    setSukranTimeoutMs(sukranDefault);
    setRequestTimeoutMs(requestDefault);
    setInsufficientFunds(false);
    setHostModalOpen(true);
  }

  async function startTable() {
    playSound("uiTap");
    const entryCost = system === "lokum" ? stake : POINTS_ENTRY_FEE;
    const paid = await spendCurrency(system, entryCost);
    if (!paid) {
      setInsufficientFunds(true);
      return;
    }
    setHostModalOpen(false);
    startGame({
      difficulty,
      sukranTimeoutMs,
      requestTimeoutMs,
      requestWarningMs: Math.min(warningWindowMs, requestTimeoutMs),
      system,
      stake: entryCost,
    });
    router.replace("/game");
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              playSound("uiTap");
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <View style={styles.headerTitleRow}>
            <CurrencyIcon system={system} size={28} />
            <View>
              <Text style={styles.headerTitle}>{tier.label}</Text>
              <Text style={styles.headerSubtitle}>{currency.name} salonları</Text>
            </View>
          </View>
          <Pressable style={styles.quickPlayButton} onPress={openHostSetup}>
            <Text style={styles.quickPlayText}>HEMEN OYNA</Text>
          </Pressable>
        </View>

        <FlatList
          data={Array.from({ length: TABLE_COUNT }, (_, index) => index)}
          keyExtractor={(index) => String(index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={tableWidth + TABLE_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.tableList}
          ItemSeparatorComponent={() => <View style={{ width: TABLE_GAP }} />}
          renderItem={({ item: index }) => (
            <Pressable
              style={[styles.tableCard, { width: tableWidth }]}
              onPress={openHostSetup}
            >
              <View style={styles.tableHeader}>
                <Text style={styles.tableNumber} numberOfLines={1}>
                  Masa {index + 1}
                </Text>
                <Text style={styles.tableMode} numberOfLines={1}>
                  {MODES[index % MODES.length]}
                </Text>
              </View>

              <View style={styles.seatsGrid}>
                <Seat label="Sen" empty />
                <Seat label="Bot 1" />
                <Seat label="Bot 2" />
                <Seat label="Bot 3" />
              </View>

              <View style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Katıl</Text>
              </View>
            </Pressable>
          )}
        />
      </View>

      {hostModalOpen && (
        <Pressable style={styles.modalBackdrop} onPress={() => setHostModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Masayı Kur</Text>
            <Text style={styles.modalSubtitle}>
              Masanın sahibi olarak oyun başlamadan önce ayarları sen belirlersin.
            </Text>

            <HostSettingsPanel
              sukranTimeoutMs={sukranTimeoutMs}
              onSukranTimeoutChange={setSukranTimeoutMs}
              requestTimeoutMs={requestTimeoutMs}
              onRequestTimeoutChange={setRequestTimeoutMs}
              currency={system}
              stake={stake}
              stakeMin={stakeMin}
              stakeMax={stakeMax}
              stakeStep={STAKE_STEP}
              onStakeChange={setStake}
            />

            {insufficientFunds && (
              <Text style={styles.insufficientText}>
                Yetersiz {currency.name.toLowerCase()} — masayı kuramazsın.
              </Text>
            )}

            <Pressable style={styles.startButton} onPress={startTable}>
              <Text style={styles.startButtonText}>MASAYI KUR VE BAŞLA</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
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
  tableList: {
    paddingBottom: SPACING.lg,
  },
  tableCard: {
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  tableHeader: {
    alignItems: "center",
  },
  tableNumber: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 13,
  },
  tableMode: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  seatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.xs,
  },
  seat: {
    alignItems: "center",
    gap: 3,
    width: "48%",
  },
  seatAvatar: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.slate,
    borderWidth: 1.5,
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
    fontSize: 7,
    fontWeight: "800",
  },
  seatLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  joinButton: {
    backgroundColor: "rgba(212, 175, 55, 0.14)",
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs + 2,
    alignItems: "center",
  },
  joinButtonText: {
    color: COLORS.goldBright,
    fontFamily: FONTS.headingBold,
    fontSize: 12,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 17, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    padding: SPACING.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 20,
    textAlign: "center",
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: -SPACING.md,
  },
  insufficientText: {
    color: "#F0A99E",
    fontSize: 12,
    textAlign: "center",
    marginTop: -SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  startButtonText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 15,
  },
});
