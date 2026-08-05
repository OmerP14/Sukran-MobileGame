import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";

interface TurnBadgeProps {
  turnNumber: number;
}

export function TurnBadge({ turnNumber }: TurnBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>TUR</Text>
      <Text style={styles.value}>{turnNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.slate,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 56,
  },
  label: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  value: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: 18,
    marginTop: 1,
  },
});
