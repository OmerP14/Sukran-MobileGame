import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { RANKS, SUITS } from "../constants/cards";
import type { CardSortOrder } from "../store/settings-store";
import type { Card } from "../types/game";
import { PlayingCard } from "./PlayingCard";

interface HumanHandProps {
  hand: Card[];
  sortOrder?: CardSortOrder;
}

const MAX_CARD_WIDTH = 72;
const MIN_CARD_WIDTH = 36;
const MAX_OVERLAP_RATIO = 0.72;
const CARD_GAP = 4;

function sortHand(hand: Card[], sortOrder: CardSortOrder): Card[] {
  const sorted = [...hand];
  if (sortOrder === "suit") {
    sorted.sort((a, b) => {
      const suitDiff = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return suitDiff !== 0 ? suitDiff : RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
    });
    return sorted;
  }
  sorted.sort((a, b) => {
    const rankDiff = RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
    return rankDiff !== 0 ? rankDiff : SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
  return sorted;
}

/**
 * Picks a card width and the horizontal step between card left-edges so that
 * `count` cards always span exactly `containerWidth` — spaced out when there's
 * room, overlapping fan-style (like a hand of UNO cards) once they no longer fit.
 */
function layoutFan(containerWidth: number, count: number) {
  if (count <= 1 || containerWidth === 0) {
    return { cardWidth: MAX_CARD_WIDTH, step: MAX_CARD_WIDTH + CARD_GAP };
  }
  const naturalTotal = MAX_CARD_WIDTH * count + CARD_GAP * (count - 1);
  if (naturalTotal <= containerWidth) {
    return { cardWidth: MAX_CARD_WIDTH, step: MAX_CARD_WIDTH + CARD_GAP };
  }
  const stepForMaxWidth = (containerWidth - MAX_CARD_WIDTH) / (count - 1);
  const minStepAllowed = MAX_CARD_WIDTH * (1 - MAX_OVERLAP_RATIO);
  if (stepForMaxWidth >= minStepAllowed) {
    return { cardWidth: MAX_CARD_WIDTH, step: stepForMaxWidth };
  }
  const denom = 1 + (count - 1) * (1 - MAX_OVERLAP_RATIO);
  const cardWidth = Math.max(MIN_CARD_WIDTH, containerWidth / denom);
  return { cardWidth, step: cardWidth * (1 - MAX_OVERLAP_RATIO) };
}

export function HumanHand({ hand, sortOrder = "rank" }: HumanHandProps) {
  const sorted = sortHand(hand, sortOrder);
  const [containerWidth, setContainerWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  const { cardWidth, step } = layoutFan(containerWidth, sorted.length);

  return (
    <View style={styles.row} onLayout={handleLayout}>
      {sorted.map((card, index) => (
        <View key={card.id} style={index === 0 ? undefined : { marginLeft: step - cardWidth }}>
          <PlayingCard card={card} width={cardWidth} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
  },
});
