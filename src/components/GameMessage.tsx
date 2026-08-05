import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { splitEmphasis } from "../utils/emphasis";

interface GameMessageProps {
  message: string;
  tone?: "neutral" | "success" | "fail";
}

const TONE_COLORS: Record<NonNullable<GameMessageProps["tone"]>, string> = {
  neutral: COLORS.textPrimary,
  success: "#8CF0D6",
  fail: "#F0A99E",
};

export function GameMessage({ message, tone = "neutral" }: GameMessageProps) {
  const segments = splitEmphasis(message);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: TONE_COLORS[tone] }]} numberOfLines={2}>
        {segments.map((segment, index) => (
          <Fragment key={index}>
            {segment.emphasis ? <Text style={styles.emphasis}>{segment.text}</Text> : segment.text}
          </Fragment>
        ))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(6, 30, 23, 0.94)",
    borderWidth: 1.5,
    borderColor: COLORS.mintDim,
    shadowColor: COLORS.mintGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
    maxWidth: "94%",
  },
  text: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  emphasis: {
    color: COLORS.goldBright,
    fontWeight: "900",
  },
});
