import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, GRADIENTS, RADIUS } from "../constants/theme";
import type { Card } from "../types/game";
import { SUIT_SYMBOLS, isRedSuit } from "../utils/format";

export type PlayingCardSize = "small" | "medium" | "large";

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: PlayingCardSize;
  /** Overrides `size` with an exact width in pixels; height/font follow the same aspect ratio. */
  width?: number;
}

const DIMENSIONS: Record<PlayingCardSize, { width: number; height: number; font: number }> = {
  small: { width: 30, height: 42, font: 11 },
  medium: { width: 44, height: 62, font: 15 },
  large: { width: 58, height: 82, font: 19 },
};

const ASPECT_RATIO = DIMENSIONS.large.height / DIMENSIONS.large.width;
const FONT_RATIO = DIMENSIONS.large.font / DIMENSIONS.large.width;

export function PlayingCard({ card, faceDown = false, size = "medium", width }: PlayingCardProps) {
  const dimensions = width
    ? { width, height: width * ASPECT_RATIO, font: width * FONT_RATIO }
    : DIMENSIONS[size];
  const cardStyle = { width: dimensions.width, height: dimensions.height };

  if (faceDown || !card) {
    return (
      <View style={[styles.shadowWrap, cardStyle]}>
        <LinearGradient colors={GRADIENTS.cardBack} style={[styles.card, styles.cardBack]}>
          <View style={[styles.backInset, { borderRadius: RADIUS.sm - 3 }]}>
            <Text style={[styles.backGlyph, { fontSize: dimensions.font }]}>Ş</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const color = isRedSuit(card.suit) ? COLORS.suitRed : COLORS.suitBlack;

  return (
    <View style={[styles.shadowWrap, cardStyle]}>
      <View style={[styles.card, styles.cardFace, cardStyle]}>
        <Text style={[styles.corner, { color, fontSize: dimensions.font }]}>{card.rank}</Text>
        <Text style={[styles.suit, { color, fontSize: dimensions.font * 1.5 }]}>
          {SUIT_SYMBOLS[card.suit]}
        </Text>
        <Text style={[styles.corner, styles.cornerBottom, { color, fontSize: dimensions.font }]}>
          {card.rank}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFace: {
    backgroundColor: COLORS.cardFace,
  },
  cardBack: {
    padding: 3,
  },
  backInset: {
    flex: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  backGlyph: {
    color: COLORS.goldBright,
    fontWeight: "700",
    fontFamily: "CinzelDecorative_700Bold",
  },
  corner: {
    position: "absolute",
    top: 2,
    left: 4,
    fontWeight: "700",
  },
  cornerBottom: {
    top: undefined,
    bottom: 2,
    left: undefined,
    right: 4,
  },
  suit: {
    fontWeight: "700",
  },
});
