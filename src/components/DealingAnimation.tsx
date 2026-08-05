import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { PlayingCard } from "./PlayingCard";

const DIRECTIONS = [
  { dx: 0, dy: -128 }, // top seat
  { dx: -170, dy: 30 }, // left seat
  { dx: 170, dy: 30 }, // right seat
  { dx: 0, dy: 168 }, // human hand
];

const ROUNDS = 3;
const ROUND_STAGGER_MS = 280;
const DIRECTION_STAGGER_MS = 45;
const FLIGHT_MS = 420;

interface FlyingCard {
  dx: number;
  dy: number;
  delay: number;
  progress: Animated.Value;
}

function buildFlyingCards(): FlyingCard[] {
  const cards: FlyingCard[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    DIRECTIONS.forEach((direction, dirIndex) => {
      cards.push({
        dx: direction.dx,
        dy: direction.dy,
        delay: round * ROUND_STAGGER_MS + dirIndex * DIRECTION_STAGGER_MS,
        progress: new Animated.Value(0),
      });
    });
  }
  return cards;
}

export function DealingAnimation() {
  const cardsRef = useRef<FlyingCard[]>(buildFlyingCards());

  useEffect(() => {
    const animations = cardsRef.current.map((card) =>
      Animated.sequence([
        Animated.delay(card.delay),
        Animated.timing(card.progress, {
          toValue: 1,
          duration: FLIGHT_MS,
          useNativeDriver: true,
        }),
      ])
    );
    const parallel = Animated.parallel(animations);
    parallel.start();
    return () => parallel.stop();
  }, []);

  return (
    <View style={styles.fill} pointerEvents="none">
      <View style={styles.deckStack}>
        <PlayingCard faceDown size="small" />
      </View>

      {cardsRef.current.map((card, index) => (
        <Animated.View
          key={index}
          style={[
            styles.flyingCard,
            {
              opacity: card.progress.interpolate({
                inputRange: [0, 0.15, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateX: card.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, card.dx],
                  }),
                },
                {
                  translateY: card.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, card.dy],
                  }),
                },
                {
                  scale: card.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.7, 1, 0.85],
                  }),
                },
              ],
            },
          ]}
        >
          <PlayingCard faceDown size="small" />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  deckStack: {
    position: "absolute",
  },
  flyingCard: {
    position: "absolute",
  },
});
