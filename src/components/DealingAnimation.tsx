import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { CardSortOrder } from "../store/settings-store";
import type { Card } from "../types/game";
import { playSound } from "../utils/sound";
import { HumanHand } from "./HumanHand";
import { OpponentHand } from "./OpponentHand";
import { PlayingCard } from "./PlayingCard";

const DIRECTIONS = [
  { dx: 0, dy: -128 }, // top seat
  { dx: -170, dy: 30 }, // left seat
  { dx: 170, dy: 30 }, // right seat
  { dx: 0, dy: 168 }, // human hand
];

// A real dealer finishes one player's whole 13-card hand before moving to
// the next — not one card to everyone, round after round. So each seat gets
// its full run of 13 cards, back to back, then the next seat starts.
const CARDS_PER_PLAYER = 13;
const CARD_STAGGER_MS = 55;
const FLIGHT_MS = 190;
// Tuned so each seat takes exactly 1s — 4 seats, so the whole deal is
// exactly 4 seconds, matching the ~2s shuffle sound played twice back to
// back (see below).
const SEAT_PAUSE_MS = 150;
const SEAT_DURATION_MS = (CARDS_PER_PLAYER - 1) * CARD_STAGGER_MS + FLIGHT_MS + SEAT_PAUSE_MS;

// Exported so the screen holding this overlay can time the "dealing" beat
// (and the hand-off to actual play) to when the animation really finishes.
export const DEALING_ANIMATION_DURATION_MS = DIRECTIONS.length * SEAT_DURATION_MS;

// Seat indices, in the same top/left/right/human order as DIRECTIONS.
const SEAT_TOP = 0;
const SEAT_LEFT = 1;
const SEAT_RIGHT = 2;
const SEAT_HUMAN = 3;

// How many cards a seat should already show face-down, ticking up card by
// card in sync with the flying-card animation. State lives in the small
// wrapper components below (not lifted up to the screen) so each card
// landing only re-renders that one hand, not the whole table.
function useDealtCardCount(seatIndex: number, active: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    setCount(0);
    const timers = Array.from({ length: CARDS_PER_PLAYER }, (_, cardIndex) => {
      const landsAt = seatIndex * SEAT_DURATION_MS + cardIndex * CARD_STAGGER_MS + FLIGHT_MS;
      return setTimeout(() => setCount((c) => c + 1), landsAt);
    });
    return () => timers.forEach(clearTimeout);
  }, [seatIndex, active]);

  return count;
}

interface DealingOpponentHandProps {
  seat: "top" | "left" | "right";
  dealing: boolean;
  actualCount: number;
  orientation?: "row" | "column";
}

const SEAT_INDEX_BY_NAME = { top: SEAT_TOP, left: SEAT_LEFT, right: SEAT_RIGHT } as const;

export function DealingOpponentHand({
  seat,
  dealing,
  actualCount,
  orientation,
}: DealingOpponentHandProps) {
  const dealtCount = useDealtCardCount(SEAT_INDEX_BY_NAME[seat], dealing);
  return <OpponentHand cardCount={dealing ? dealtCount : actualCount} orientation={orientation} />;
}

interface DealingHumanHandProps {
  hand: Card[];
  sortOrder: CardSortOrder;
  dealing: boolean;
}

export function DealingHumanHand({ hand, sortOrder, dealing }: DealingHumanHandProps) {
  const dealtCount = useDealtCardCount(SEAT_HUMAN, dealing);
  return <HumanHand hand={hand} sortOrder={sortOrder} revealCount={dealing ? dealtCount : undefined} />;
}

interface FlyingCard {
  dx: number;
  dy: number;
  delay: number;
  progress: Animated.Value;
}

function buildFlyingCards(): FlyingCard[] {
  const cards: FlyingCard[] = [];
  DIRECTIONS.forEach((direction, seatIndex) => {
    for (let cardIndex = 0; cardIndex < CARDS_PER_PLAYER; cardIndex++) {
      cards.push({
        dx: direction.dx,
        dy: direction.dy,
        delay: seatIndex * SEAT_DURATION_MS + cardIndex * CARD_STAGGER_MS,
        progress: new Animated.Value(0),
      });
    }
  });
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

    // The shuffle sound is ~2s but the deal takes 4s, so play it twice back
    // to back rather than leaving the second half silent — not one per
    // card, which is also what used to make this animation stutter (dozens
    // of overlapping long clips fighting for playback). The clip fades out
    // over its last ~150ms, so waiting the full nominal half (2000ms) left
    // an audible dead patch before the second copy kicked in — starting it
    // a bit earlier overlaps the fade instead of a gap of silence.
    const SHUFFLE_REPEAT_MS = DEALING_ANIMATION_DURATION_MS / 2 - 250;
    playSound("cardDeal");
    const secondShuffleTimer = setTimeout(() => playSound("cardDeal"), SHUFFLE_REPEAT_MS);

    return () => {
      parallel.stop();
      clearTimeout(secondShuffleTimer);
    };
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
