import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { SET_ANNOUNCEMENT_DISPLAY_MS } from "../constants/config";
import { COLORS, FONTS, GRADIENTS, RADIUS } from "../constants/theme";
import type { Rank } from "../types/game";
import { RANK_LABELS } from "../utils/format";

interface SetCompleteBannerProps {
  playerName: string;
  rank: Rank;
  onDone: () => void;
}

const HOLD_MS = SET_ANNOUNCEMENT_DISPLAY_MS - 450;

interface Sparkle {
  angle: number;
  distance: number;
  delay: number;
  size: number;
}

const SPARKLES: Sparkle[] = [
  { angle: -70, distance: 70, delay: 120, size: 16 },
  { angle: -25, distance: 90, delay: 60, size: 12 },
  { angle: 20, distance: 88, delay: 180, size: 14 },
  { angle: 70, distance: 66, delay: 40, size: 12 },
  { angle: 150, distance: 80, delay: 150, size: 13 },
  { angle: -140, distance: 78, delay: 90, size: 15 },
];

export function SetCompleteBanner({ playerName, rank, onDone }: SetCompleteBannerProps) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(-1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.5)).current;
  const sparkleAnims = useRef(SPARKLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    );

    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 140 }),
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.spring(rotate, { toValue: 0, useNativeDriver: true, friction: 4, tension: 140 }),
        ]),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.stagger(
          40,
          sparkleAnims.map((value, index) =>
            Animated.sequence([
              Animated.delay(SPARKLES[index].delay),
              Animated.timing(value, { toValue: 1, duration: 380, useNativeDriver: true }),
            ])
          )
        ),
      ]),
      Animated.delay(HOLD_MS),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 400, useNativeDriver: true }),
      ]),
    ]);

    glowLoop.start();
    sequence.start(({ finished }) => {
      glowLoop.stop();
      if (finished) {
        onDone();
      }
    });
    return () => {
      glowLoop.stop();
      sequence.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rank, playerName]);

  const rotateDeg = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-6deg", "0deg", "6deg"],
  });

  return (
    <Animated.View style={[styles.wrap, { opacity }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.glowRing,
          {
            opacity: glow,
            transform: [
              { scale: glow.interpolate({ inputRange: [0.5, 1], outputRange: [0.94, 1.08] }) },
            ],
          },
        ]}
      />

      {SPARKLES.map((sparkle, index) => {
        const anim = sparkleAnims[index];
        const dx = Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance;
        const dy = Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance;
        return (
          <Animated.Text
            key={index}
            style={[
              styles.sparkle,
              {
                fontSize: sparkle.size,
                opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 0.4, 1],
                      outputRange: [0.2, 1, 0.6],
                    }),
                  },
                ],
              },
            ]}
          >
            ✦
          </Animated.Text>
        );
      })}

      <Animated.View style={{ transform: [{ scale }, { rotate: rotateDeg }] }}>
        <LinearGradient colors={GRADIENTS.goldButton} style={styles.badge}>
          <Text style={styles.title}>DÖRTLÜ TAMAMLANDI</Text>
          <Text style={styles.subtitle}>
            {playerName} · 4 {RANK_LABELS[rank]}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  glowRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: COLORS.glow,
  },
  sparkle: {
    position: "absolute",
    color: COLORS.goldBright,
  },
  badge: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.display,
    fontSize: 18,
    letterSpacing: 1.5,
  },
  subtitle: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.heading,
    fontSize: 13,
  },
});
