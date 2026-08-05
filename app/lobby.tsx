import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CurrencyIcon } from "../src/components/CurrencyIcon";
import { GradientBackground } from "../src/components/GradientBackground";
import {
  CURRENCY_INFO,
  TIERS,
  formatBalance,
  formatTierRange,
  isTierUnlocked,
  type CurrencySystem,
} from "../src/constants/lobby";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useProfileStore } from "../src/store/profile-store";

export default function LobbyScreen() {
  const profile = useProfileStore((state) => state.profile);
  const hydrated = useProfileStore((state) => state.hydrated);
  const logout = useProfileStore((state) => state.logout);

  const [system, setSystem] = useState<CurrencySystem>("lokum");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace("/login");
    }
  }, [hydrated, profile]);

  if (!profile) {
    return <GradientBackground />;
  }

  const balance = system === "points" ? profile.points : profile.lokum;
  const currency = CURRENCY_INFO[system];

  function openTier(tierId: string) {
    router.push({ pathname: "/rooms", params: { system, tier: tierId } });
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.leftGroup}>
            <Pressable style={styles.iconButton} onPress={() => setMenuOpen(true)}>
              <Text style={styles.iconButtonText}>☰</Text>
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.displayName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.displayName} numberOfLines={1}>
              {profile.displayName}
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.balances}>
            <View style={styles.balanceChip}>
              <CurrencyIcon system="lokum" size={22} />
              <Text style={styles.balanceText}>{formatBalance(profile.lokum)}</Text>
            </View>
            <View style={styles.balanceChip}>
              <CurrencyIcon system="points" size={22} />
              <Text style={styles.balanceText}>{formatBalance(profile.points)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionDiamond}>◆</Text>
          <Text style={styles.sectionTitle}>Şükran {currency.name}lı Oyun Salonları</Text>
          <Text style={styles.sectionDiamond}>◆</Text>
        </View>

        <View style={styles.tierGrid}>
          {TIERS.map((tier) => {
            const unlocked = isTierUnlocked(tier, balance);
            return (
              <View key={tier.id} style={styles.tierColumn}>
                <Pressable
                  style={[styles.tierCard, !unlocked && styles.tierCardLocked]}
                  onPress={() => unlocked && openTier(tier.id)}
                  disabled={!unlocked}
                >
                  <View style={styles.tierIconBox}>
                    <CurrencyIcon system={system} size={52} />
                    {!unlocked && (
                      <View style={styles.lockedRibbon}>
                        <Text style={styles.lockedRibbonText}>
                          YETERSİZ {currency.name.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.tierRangeBar}>
                    <Text style={styles.tierRangeText}>{formatTierRange(tier)}</Text>
                  </View>
                </Pressable>
                <Text style={styles.tierLabel}>{tier.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.systemSwitcher}>
          <Pressable
            style={[styles.switchIcon, system === "lokum" && styles.switchIconSelected]}
            onPress={() => setSystem("lokum")}
          >
            <CurrencyIcon system="lokum" size={26} />
          </Pressable>
          <Pressable
            style={[styles.switchIcon, system === "points" && styles.switchIconSelected]}
            onPress={() => setSystem("points")}
          >
            <CurrencyIcon system="points" size={26} />
          </Pressable>
        </View>

        {menuOpen && (
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
            <View style={styles.menuCard}>
              <MenuItem
                label="Nasıl Oynanır?"
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/rules");
                }}
              />
              <MenuItem
                label="Ayarlar"
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
              />
              <MenuItem
                label="İstatistikler"
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/statistics");
                }}
              />
              <MenuItem label="Çıkış Yap" danger onPress={handleLogout} />
            </View>
          </Pressable>
        )}
      </View>
    </GradientBackground>
  );
}

function MenuItem({
  label,
  danger,
  onPress,
}: {
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  spacer: {
    flex: 1,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: COLORS.gold,
    fontSize: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.slate,
    borderWidth: 3,
    borderColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: 19,
  },
  displayName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 20,
    maxWidth: 200,
  },
  balances: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  balanceText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 17,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  sectionDiamond: {
    color: COLORS.gold,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  tierGrid: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  tierColumn: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  tierCard: {
    width: 150,
    backgroundColor: COLORS.cardFace,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  tierCardLocked: {
    opacity: 0.75,
  },
  tierIconBox: {
    width: "100%",
    height: 96,
    backgroundColor: COLORS.feltMid,
    alignItems: "center",
    justifyContent: "center",
  },
  tierRangeBar: {
    backgroundColor: COLORS.feltBottom,
    paddingVertical: SPACING.xs + 2,
    alignItems: "center",
  },
  tierRangeText: {
    color: COLORS.goldBright,
    fontWeight: "800",
    fontSize: 12,
  },
  tierLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 15,
  },
  lockedRibbon: {
    position: "absolute",
    backgroundColor: COLORS.danger,
    paddingHorizontal: 22,
    paddingVertical: 4,
    transform: [{ rotate: "-14deg" }],
  },
  lockedRibbonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  systemSwitcher: {
    flexDirection: "row",
    alignSelf: "center",
    gap: SPACING.md,
  },
  switchIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.panel,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  switchIconSelected: {
    borderColor: COLORS.mint,
  },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 17, 12, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  menuCard: {
    width: 280,
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    padding: SPACING.sm,
  },
  menuItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 16,
    textAlign: "center",
  },
  menuItemTextDanger: {
    color: "#F0A99E",
  },
});
