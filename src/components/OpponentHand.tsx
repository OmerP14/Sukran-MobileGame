import { StyleSheet, View } from "react-native";
import { PlayingCard } from "./PlayingCard";

interface OpponentHandProps {
  cardCount: number;
  orientation?: "row" | "column";
}

export function OpponentHand({ cardCount, orientation = "row" }: OpponentHandProps) {
  const isColumn = orientation === "column";
  return (
    <View style={isColumn ? styles.column : styles.row}>
      {Array.from({ length: cardCount }, (_, index) => (
        <View
          key={index}
          style={index === 0 ? undefined : isColumn ? styles.overlapColumn : styles.overlapRow}
        >
          <PlayingCard faceDown size="small" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
  },
  overlapRow: {
    marginLeft: -18,
  },
  overlapColumn: {
    marginTop: -30,
  },
});
