import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { RANKS } from "../constants/cards";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";
import type { Player, Rank } from "../types/game";

const AMOUNTS = [1, 2, 3] as const;

type Step = "target" | "rank" | "amount";
const STEPS: Step[] = ["target", "rank", "amount"];

const STEP_TITLES: Record<Step, string> = {
  target: "Kimden istiyorsun?",
  rank: "Hangi kart?",
  amount: "Kaç tane?",
};

interface CardRequestPanelProps {
  opponents: Player[];
  disabled?: boolean;
  remainingMs?: number;
  totalMs?: number;
  urgent?: boolean;
  onSubmit: (params: { targetPlayerId: string; rank: Rank; amount: 1 | 2 | 3 | 4 }) => void;
}

export function CardRequestPanel({
  opponents,
  disabled = false,
  remainingMs,
  totalMs,
  urgent = false,
  onSubmit,
}: CardRequestPanelProps) {
  const [step, setStep] = useState<Step>("target");
  const [targetPlayerId, setTargetPlayerId] = useState<string | undefined>(undefined);
  const [rank, setRank] = useState<Rank | undefined>(undefined);
  const fade = useRef(new Animated.Value(1)).current;

  function goTo(nextStep: Step) {
    Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  }

  function handlePickTarget(id: string) {
    setTargetPlayerId(id);
    goTo("rank");
  }

  function handlePickRank(r: Rank) {
    setRank(r);
    goTo("amount");
  }

  function handlePickAmount(amount: 1 | 2 | 3) {
    if (!targetPlayerId || !rank) {
      return;
    }
    onSubmit({ targetPlayerId, rank, amount });
    setTargetPlayerId(undefined);
    setRank(undefined);
    setStep("target");
    fade.setValue(1);
  }

  function handleBack() {
    if (step === "rank") {
      setRank(undefined);
      goTo("target");
    } else if (step === "amount") {
      goTo("rank");
    }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <View style={styles.backdrop} pointerEvents={disabled ? "none" : "auto"}>
      <View style={styles.modal}>
        <View style={styles.header}>
          {step !== "target" ? (
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}

          <View style={styles.headerCenter}>
            <Text style={[styles.title, urgent && styles.titleUrgent]}>
              {urgent ? "Çabuk seç!" : STEP_TITLES[step]}
            </Text>
            <View style={styles.dotsRow}>
              {STEPS.map((s, index) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    index === stepIndex && styles.dotActive,
                    index < stepIndex && styles.dotDone,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.backButton} />
        </View>

        {remainingMs !== undefined && totalMs !== undefined && (
          <View style={styles.timerTrack}>
            <View
              style={[
                styles.timerFill,
                urgent && styles.timerFillUrgent,
                { width: `${Math.max(0, (remainingMs / totalMs) * 100)}%` },
              ]}
            />
          </View>
        )}

        <Animated.View style={[styles.stepArea, { opacity: fade }]}>
          {step === "target" && (
            <View style={styles.optionRow}>
              {opponents.map((opponent) => (
                <RoundChip
                  key={opponent.id}
                  label={opponent.name}
                  diameter={78}
                  fontSize={15}
                  onPress={() => handlePickTarget(opponent.id)}
                />
              ))}
            </View>
          )}

          {step === "rank" && (
            <View style={styles.optionGrid}>
              {RANKS.map((r) => (
                <RoundChip
                  key={r}
                  label={r}
                  diameter={56}
                  fontSize={16}
                  onPress={() => handlePickRank(r)}
                />
              ))}
            </View>
          )}

          {step === "amount" && (
            <View style={styles.optionRow}>
              {AMOUNTS.map((a) => (
                <RoundChip
                  key={a}
                  label={String(a)}
                  diameter={72}
                  fontSize={24}
                  onPress={() => handlePickAmount(a)}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

interface RoundChipProps {
  label: string;
  diameter: number;
  fontSize: number;
  onPress: () => void;
}

function RoundChip({ label, diameter, fontSize, onPress }: RoundChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roundChip, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}
    >
      <Text
        style={[styles.roundChipText, { fontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 17, 12, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 25,
  },
  modal: {
    width: "92%",
    maxWidth: 640,
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    padding: SPACING.md,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  backButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: "700",
  },
  title: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 15,
    textAlign: "center",
  },
  titleUrgent: {
    color: "#F0A99E",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dotActive: {
    backgroundColor: COLORS.mint,
  },
  dotDone: {
    backgroundColor: COLORS.gold,
  },
  timerTrack: {
    height: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.pill,
  },
  timerFillUrgent: {
    backgroundColor: "#E8756A",
  },
  stepArea: {
    minHeight: 150,
    justifyContent: "center",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  roundChip: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  roundChipText: {
    color: COLORS.cream,
    fontWeight: "700",
  },
});
