import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import type { Player } from "../types/game";

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function PlayerSeat({ player, isCurrentTurn }: PlayerSeatProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.pill, isCurrentTurn && styles.pillActive]}>
        <Text style={styles.pillText}>{player.completedSets.length}</Text>
      </View>
      <View style={[styles.avatar, isCurrentTurn && styles.avatarActive]}>
        <Text style={styles.avatarText}>{initials(player.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {player.name}
      </Text>
    </View>
  );
}

const AVATAR_SIZE = 46;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: -10,
  },
  pill: {
    minWidth: 34,
    height: 26,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.slate,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    zIndex: 1,
  },
  pillActive: {
    borderColor: COLORS.mintDim,
  },
  pillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.slate,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarActive: {
    borderColor: COLORS.mint,
    shadowColor: COLORS.mintGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: 15,
  },
  name: {
    marginLeft: 6,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 76,
  },
});
