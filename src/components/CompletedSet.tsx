import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import type { Rank } from "../types/game";

interface CompletedSetProps {
  rank: Rank;
}

export function CompletedSet({ rank }: CompletedSetProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
    marginTop: 3,
  },
  text: {
    color: COLORS.feltBottom,
    fontSize: 10,
    fontWeight: "800",
  },
});
