import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CardRequestPanel } from "../src/components/CardRequestPanel";
import {
  DEALING_ANIMATION_DURATION_MS,
  DealingAnimation,
  DealingHumanHand,
  DealingOpponentHand,
} from "../src/components/DealingAnimation";
import { GameMessage } from "../src/components/GameMessage";
import { GradientBackground } from "../src/components/GradientBackground";
import { PlayerSeat } from "../src/components/PlayerSeat";
import { PlayerSettingsPanel } from "../src/components/PlayerSettingsPanel";
import { SetCompleteBanner } from "../src/components/SetCompleteBanner";
import { TurnBadge } from "../src/components/TurnBadge";
import { COLORS, FONTS, GRADIENTS, RADIUS, SPACING } from "../src/constants/theme";
import { useGameStore } from "../src/store/game-store";
import { useSettingsStore } from "../src/store/settings-store";
import type { Player } from "../src/types/game";
import { emphasize, formatLastMoveMessage, getPlayerName } from "../src/utils/format";
import { playSound } from "../src/utils/sound";

const HUMAN_ID = "human";
const JOINING_STAGE_MS = 550;
const DEALING_BUFFER_MS = 200;
// sukran-timeout.mp3 is ~1.1s — repeat a little sooner than that so the tick
// loop doesn't leave an audible gap between repeats.
const SUKRAN_TIMEOUT_LOOP_MS = 950;

export default function GameScreen() {
  const players = useGameStore((state) => state.players);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const phase = useGameStore((state) => state.phase);
  const lastMove = useGameStore((state) => state.lastMove);
  const winnerIds = useGameStore((state) => state.winnerIds);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const sessionStats = useGameStore((state) => state.sessionStats);
  const sukranTimeoutMs = useGameStore((state) => state.sukranTimeoutMs);
  const requestTimeoutMs = useGameStore((state) => state.requestTimeoutMs);
  const requestWarningMs = useGameStore((state) => state.requestWarningMs);
  const pendingAnnouncement = useGameStore((state) => state.pendingAnnouncement);
  const completedSetAnnouncement = useGameStore((state) => state.completedSetAnnouncement);
  const submitCardRequest = useGameStore((state) => state.submitCardRequest);
  const confirmSukran = useGameStore((state) => state.confirmSukran);
  const handleSukranTimeout = useGameStore((state) => state.handleSukranTimeout);
  const runBotTurn = useGameStore((state) => state.runBotTurn);
  const resetGame = useGameStore((state) => state.resetGame);
  const dismissCompletedSetAnnouncement = useGameStore(
    (state) => state.dismissCompletedSetAnnouncement
  );

  const cardSortOrder = useSettingsStore((state) => state.settings.cardSortOrder);
  const hapticsEnabled = useSettingsStore((state) => state.settings.hapticsEnabled);
  const recordGameResult = useSettingsStore((state) => state.recordGameResult);

  const botTurnKeyRef = useRef<string | null>(null);
  const resultRecordedRef = useRef(false);
  const [sukranRemainingMs, setSukranRemainingMs] = useState(sukranTimeoutMs);
  const [requestRemainingMs, setRequestRemainingMs] = useState(requestTimeoutMs);
  const [dealingStage, setDealingStage] = useState<"joining" | "dealing">("joining");
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);

  useEffect(() => {
    if (phase === "setup") {
      router.replace("/lobby");
    }
  }, [phase]);

  // Brief "everyone's taking their seat, then the deck is dealt" beat before
  // the first request can be made — a sound effect lands on the dealing step,
  // and the flying-card animation only plays during the "dealing" half. Play
  // only starts once the dealing animation has actually finished.
  useEffect(() => {
    if (phase !== "dealing") {
      return;
    }
    setDealingStage("joining");
    const dealTimer = setTimeout(() => setDealingStage("dealing"), JOINING_STAGE_MS);
    const startTimer = setTimeout(
      () => useGameStore.getState().beginPlay(),
      JOINING_STAGE_MS + DEALING_ANIMATION_DURATION_MS + DEALING_BUFFER_MS
    );
    return () => {
      clearTimeout(dealTimer);
      clearTimeout(startTimer);
    };
  }, [phase]);

  useEffect(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    // turnNumber must be part of the key: a bot that wins and keeps its turn
    // returns to the exact same phase+currentPlayerId, so without it this
    // effect would never fire again for that bot's next move.
    const key = `${phase}:${currentPlayerId}:${turnNumber}`;
    if (
      phase === "waiting_for_request" &&
      currentPlayer?.type === "bot" &&
      botTurnKeyRef.current !== key
    ) {
      botTurnKeyRef.current = key;
      runBotTurn();
    }
  }, [phase, currentPlayerId, turnNumber, players, runBotTurn]);

  useEffect(() => {
    if (phase !== "game_over" || resultRecordedRef.current) {
      return;
    }
    resultRecordedRef.current = true;
    playSound(winnerIds.includes(HUMAN_ID) ? "gameWin" : "gameLose");
    const human = players.find((p) => p.id === HUMAN_ID);
    recordGameResult({
      won: winnerIds.includes(HUMAN_ID),
      completedSets: human?.completedSets.length ?? 0,
      successfulRequests: sessionStats.successfulRequests,
      failedRequests: sessionStats.failedRequests,
      sukranForgotten: sessionStats.sukranForgotten,
    });
    router.replace("/result");
  }, [phase, players, winnerIds, sessionStats, recordGameResult]);

  const showSukranOverlay = phase === "waiting_for_sukran" && currentPlayerId === HUMAN_ID;

  useEffect(() => {
    if (showSukranOverlay) {
      playSound("sukranAppear");
    }
  }, [showSukranOverlay]);

  useEffect(() => {
    if (!showSukranOverlay) {
      return;
    }
    const startedAt = Date.now();
    setSukranRemainingMs(sukranTimeoutMs);
    const interval = setInterval(() => {
      const left = Math.max(0, sukranTimeoutMs - (Date.now() - startedAt));
      setSukranRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        handleSukranTimeout();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [showSukranOverlay, sukranTimeoutMs, handleSukranTimeout, hapticsEnabled]);

  // Şükran being forgotten gets the same "kart yok" sound as a failed
  // request — whoever forgot it, human or bot — but only when the turn
  // lands on someone else afterwards; if it lands on the human, the "your
  // turn" cue further down already covers it. Watched via
  // sessionStats.sukranForgotten (which increments either way) rather than
  // lastMove, since neither confirmSukran nor handleSukranTimeout touch any
  // of the lastMove fields the effect below depends on — and this is the
  // only way to catch a BOT forgetting Şükran at all, which previously had
  // no sound whatsoever.
  const sukranForgottenCountRef = useRef(sessionStats.sukranForgotten);
  useEffect(() => {
    if (sessionStats.sukranForgotten === sukranForgottenCountRef.current) {
      return;
    }
    sukranForgottenCountRef.current = sessionStats.sukranForgotten;
    if (currentPlayerId !== HUMAN_ID) {
      playSound("requestFail");
    }
  }, [sessionStats.sukranForgotten, currentPlayerId]);

  useEffect(() => {
    if (completedSetAnnouncement && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completedSetAnnouncement, hapticsEnabled]);

  // A resolved request only gets a sound here on failure ("Yok") — a
  // success is never announced by this effect at all, whether it's the
  // human's or a bot's: a completed dörtlü only gets a haptic (no sound,
  // see completedSetAnnouncement above), and an ordinary successful take
  // (no dörtlü) is silent by design. Failure gets a sound for everyone,
  // except when it hands the turn
  // straight to the human: that moment already gets its own "your turn" cue
  // below, and playing both together is what was confusing. Deliberately
  // keyed on the move's own fields rather than the `lastMove` object
  // itself: confirmSukran/handleSukranTimeout both rebuild lastMove
  // (`{ ...lastMove, forgotSukran }`) to record the Şükran outcome, which
  // would otherwise replay this sound when a player just timed out on Şükran.
  useEffect(() => {
    if (lastMove && !lastMove.success && currentPlayerId !== HUMAN_ID) {
      playSound("requestFail");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lastMove?.requesterId,
    lastMove?.targetPlayerId,
    lastMove?.rank,
    lastMove?.requestedAmount,
    lastMove?.transferredAmount,
    lastMove?.success,
  ]);

  // Light haptic whenever the player's own request just succeeded.
  useEffect(() => {
    if (lastMove?.success && lastMove.requesterId === HUMAN_ID && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [lastMove, hapticsEnabled]);

  // Hold off on the request panel (and its countdown) while a "dörtlü
  // tamamlandı" celebration is still playing, so its ~2s animation doesn't
  // eat into the 8 seconds the player gets to choose their next request.
  const showRequestPanelForTimer =
    phase === "waiting_for_request" && currentPlayerId === HUMAN_ID && !completedSetAnnouncement;

  // "Your turn" cue — deliberately request-success, not sukran-appear:
  // sukran-appear is reserved for the ŞÜKRAN button itself. Only fires when
  // the human genuinely just gained the turn from someone else — not
  // merely continuing their own turn after confirming Şükran or dismissing
  // a dörtlü tamamlandı banner (currentPlayerId never actually left
  // HUMAN_ID during either of those), and not on every successful request
  // in a row while they keep the turn. Tracked by remembering the last
  // player this already played for, reset the moment the turn is no longer
  // the human's at all.
  const lastYourTurnPlayerRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentPlayerId !== HUMAN_ID) {
      lastYourTurnPlayerRef.current = null;
      return;
    }
    if (showRequestPanelForTimer && lastYourTurnPlayerRef.current !== currentPlayerId) {
      playSound("requestSuccess");
      lastYourTurnPlayerRef.current = currentPlayerId;
    }
  }, [currentPlayerId, showRequestPanelForTimer]);

  useEffect(() => {
    if (!showRequestPanelForTimer) {
      return;
    }
    const startedAt = Date.now();
    setRequestRemainingMs(requestTimeoutMs);
    const interval = setInterval(() => {
      const left = Math.max(0, requestTimeoutMs - (Date.now() - startedAt));
      setRequestRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        useGameStore.getState().forfeitCurrentRequest();
        // The human missed their window — that's a "kart yok"-shaped
        // outcome too, same suppression rule as everywhere else: only if
        // the turn actually moves off them.
        if (useGameStore.getState().currentPlayerId !== HUMAN_ID) {
          playSound("requestFail");
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [showRequestPanelForTimer, requestTimeoutMs]);

  // The actual tick-tick countdown cue, once the request timer gets down to
  // its last few seconds — a "hurry up" nudge, distinct from the one-off
  // "your turn" ding above.
  const requestUrgent =
    showRequestPanelForTimer && requestRemainingMs > 0 && requestRemainingMs <= requestWarningMs;

  useEffect(() => {
    if (!requestUrgent) {
      return;
    }
    // The clip itself is only ~1.1s but the urgent window can run several
    // seconds (longer in the newbie room) — loop it for as long as the
    // urgency lasts instead of leaving it to play once and go silent.
    playSound("sukranTimeout");
    const interval = setInterval(() => playSound("sukranTimeout"), SUKRAN_TIMEOUT_LOOP_MS);
    return () => clearInterval(interval);
  }, [requestUrgent]);

  // The moment a request succeeds, the transferred/completed cards are already
  // gone from the hand in the store — but the player hasn't said Şükran yet.
  // Freeze that player's displayed hand/seat at their pre-transfer snapshot
  // for the duration of the Şükran phase, so nothing visibly changes until
  // Şükran is actually resolved (confirmed or timed out).
  const frozenPlayerRef = useRef<Player | null>(null);
  const prevPhaseRef = useRef(phase);
  const prevPlayersRef = useRef(players);
  if (phase === "waiting_for_sukran" && prevPhaseRef.current !== "waiting_for_sukran") {
    frozenPlayerRef.current = prevPlayersRef.current.find((p) => p.id === currentPlayerId) ?? null;
  } else if (phase !== "waiting_for_sukran") {
    frozenPlayerRef.current = null;
  }
  prevPhaseRef.current = phase;
  prevPlayersRef.current = players;

  function displayed(player: Player | undefined): Player | undefined {
    if (player && frozenPlayerRef.current && frozenPlayerRef.current.id === player.id) {
      return frozenPlayerRef.current;
    }
    return player;
  }

  if (phase === "setup" || players.length === 0) {
    return <GradientBackground />;
  }

  const human = displayed(players.find((p) => p.id === HUMAN_ID));
  const botTop = displayed(players.find((p) => p.id === "bot-2"));
  const botLeft = displayed(players.find((p) => p.id === "bot-1"));
  const botRight = displayed(players.find((p) => p.id === "bot-3"));
  // A player with an empty hand has nothing to give — never a valid target,
  // even if it's still their turn to make their own request.
  const opponents = players.filter((p) => p.id !== HUMAN_ID && p.hand.length > 0);

  const isHumanTurn = currentPlayerId === HUMAN_ID;
  const showRequestPanel =
    phase === "waiting_for_request" && isHumanTurn && !completedSetAnnouncement;
  const currentPlayerName = getPlayerName(players, currentPlayerId);

  // What just happened (who took what from whom, or "Yok") always takes
  // priority over generic status text, no matter whose turn it is now —
  // otherwise a bot taking cards from you gets buried under "X oynuyor…".
  let message: string;
  let tone: "neutral" | "success" | "fail" = "neutral";
  if (pendingAnnouncement) {
    message = pendingAnnouncement;
  } else if (phase === "waiting_for_sukran" && lastMove) {
    message = `${formatLastMoveMessage(lastMove, players)} ${emphasize(currentPlayerName)} Şükran diyecek…`;
    tone = "success";
  } else if (lastMove) {
    message = formatLastMoveMessage(lastMove, players);
    tone = lastMove.success ? "success" : "fail";
  } else if (!isHumanTurn) {
    message = `${emphasize(currentPlayerName)} oynuyor…`;
  } else {
    message = "Sırada sen varsın";
  }

  return (
    <GradientBackground edges={["top", "bottom", "left", "right"]}>
      <View style={styles.table}>
        <Pressable
          style={styles.quitButton}
          onPress={() => {
            playSound("uiTap");
            resetGame();
            router.replace("/lobby");
          }}
        >
          <Text style={styles.quitButtonText}>✕</Text>
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => {
            playSound("uiTap");
            setPlayerSettingsOpen(true);
          }}
        >
          <Text style={styles.settingsButtonText}>⚙</Text>
        </Pressable>

        <View style={styles.turnBadgeWrap}>
          <TurnBadge turnNumber={turnNumber} />
        </View>

        {botTop && (
          <View style={styles.topSeatWrap}>
            <View style={styles.topHandBleed}>
              <DealingOpponentHand
                seat="top"
                dealing={phase === "dealing"}
                actualCount={botTop.hand.length}
              />
            </View>
            <PlayerSeat player={botTop} isCurrentTurn={currentPlayerId === botTop.id} />
          </View>
        )}

        {botLeft && (
          <View style={styles.leftSeatWrap}>
            <View style={styles.leftHandBleed}>
              <DealingOpponentHand
                seat="left"
                dealing={phase === "dealing"}
                actualCount={botLeft.hand.length}
                orientation="column"
              />
            </View>
            <PlayerSeat player={botLeft} isCurrentTurn={currentPlayerId === botLeft.id} />
          </View>
        )}

        {botRight && (
          <View style={styles.rightSeatWrap}>
            <View style={styles.rightHandBleed}>
              <DealingOpponentHand
                seat="right"
                dealing={phase === "dealing"}
                actualCount={botRight.hand.length}
                orientation="column"
              />
            </View>
            <PlayerSeat player={botRight} isCurrentTurn={currentPlayerId === botRight.id} />
          </View>
        )}

        {!showRequestPanel && !completedSetAnnouncement && (
          <View style={styles.centerWrap}>
            <GameMessage message={message} tone={tone} />
          </View>
        )}

        {human && (
          <View style={styles.humanBlock}>
            <PlayerSeat player={human} isCurrentTurn={isHumanTurn} />
            <View style={styles.humanHandWrap}>
              <DealingHumanHand
                hand={human.hand}
                sortOrder={cardSortOrder}
                dealing={phase === "dealing"}
              />
            </View>
          </View>
        )}

        {showRequestPanel && (
          <CardRequestPanel
            opponents={opponents}
            remainingMs={requestRemainingMs}
            totalMs={requestTimeoutMs}
            urgent={requestRemainingMs <= requestWarningMs}
            onSubmit={({ targetPlayerId, rank, amount }) => {
              submitCardRequest({ requesterId: HUMAN_ID, targetPlayerId, rank, amount });
              // Resolution is synchronous, so the outcome is already in the
              // store — only play the "sent" whoosh on success. A failure
              // gets its own "kart yok" sound below; playing both together
              // for the same tap is what sounded like clashing.
              if (useGameStore.getState().lastMove?.success) {
                playSound("requestSubmit");
              }
            }}
          />
        )}

        {completedSetAnnouncement && phase !== "waiting_for_sukran" && (
          <SetCompleteBanner
            playerName={completedSetAnnouncement.playerName}
            rank={completedSetAnnouncement.rank}
            onDone={dismissCompletedSetAnnouncement}
          />
        )}

        {showSukranOverlay && (
          <View style={styles.sukranOverlay} pointerEvents="box-none">
            <Pressable
              onPress={() => {
                playSound("sukranConfirm");
                if (hapticsEnabled) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                confirmSukran();
              }}
            >
              <LinearGradient colors={GRADIENTS.goldButton} style={styles.sukranButton}>
                <Text style={styles.sukranButtonText}>ŞÜKRAN</Text>
                <Text style={styles.sukranButtonHint}>Sıranı sürdürmek için dokun</Text>
                <View style={styles.sukranProgressTrack}>
                  <View
                    style={[
                      styles.sukranProgressFill,
                      { width: `${(sukranRemainingMs / sukranTimeoutMs) * 100}%` },
                    ]}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {dealingStage === "dealing" && phase === "dealing" && <DealingAnimation />}

        {phase === "dealing" && (
          <View style={styles.dealingBanner} pointerEvents="none">
            <Text style={styles.dealingTitle}>ŞÜKRAN</Text>
            <Text style={styles.dealingMessageText}>
              {dealingStage === "joining" ? "Oyuncular masaya oturuyor…" : "Kartlar dağıtılıyor…"}
            </Text>
          </View>
        )}
      </View>

      {playerSettingsOpen && (
        <Pressable style={styles.settingsBackdrop} onPress={() => setPlayerSettingsOpen(false)}>
          <Pressable style={styles.settingsCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.settingsTitle}>Ayarlarım</Text>
            <PlayerSettingsPanel />
          </Pressable>
        </Pressable>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    position: "relative",
  },
  quitButton: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  quitButtonText: {
    color: COLORS.cream,
    fontWeight: "700",
    fontSize: 13,
  },
  settingsButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  settingsButtonText: {
    color: COLORS.cream,
    fontSize: 15,
  },
  settingsBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 17, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    padding: SPACING.lg,
  },
  settingsCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  settingsTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 20,
    textAlign: "center",
  },
  turnBadgeWrap: {
    position: "absolute",
    top: 4,
    left: 42,
    zIndex: 30,
  },
  topSeatWrap: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  topHandBleed: {
    marginBottom: -14,
    opacity: 0.95,
  },
  leftSeatWrap: {
    position: "absolute",
    left: 4,
    top: "42%",
    alignItems: "flex-start",
    zIndex: 5,
  },
  leftHandBleed: {
    position: "absolute",
    left: -8,
    bottom: 42,
    opacity: 0.95,
  },
  rightSeatWrap: {
    position: "absolute",
    right: 4,
    top: "42%",
    alignItems: "flex-end",
    zIndex: 5,
  },
  rightHandBleed: {
    position: "absolute",
    right: -8,
    bottom: 42,
    opacity: 0.95,
  },
  centerWrap: {
    position: "absolute",
    top: "36%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 4,
  },
  humanBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: "center",
    gap: 2,
    zIndex: 10,
  },
  humanHandWrap: {
    width: "100%",
    marginTop: -4,
    paddingHorizontal: 10,
  },
  sukranOverlay: {
    position: "absolute",
    top: "22%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 40,
  },
  sukranButton: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: 56,
    paddingVertical: 22,
    alignItems: "center",
    gap: 4,
  },
  sukranButtonText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.display,
    fontSize: 30,
    letterSpacing: 2,
  },
  sukranButtonHint: {
    color: COLORS.feltBottom,
    fontSize: 12,
    opacity: 0.75,
  },
  sukranProgressTrack: {
    width: 160,
    height: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(3, 17, 12, 0.3)",
    marginTop: 8,
    overflow: "hidden",
  },
  sukranProgressFill: {
    height: "100%",
    backgroundColor: COLORS.feltBottom,
    borderRadius: RADIUS.pill,
  },
  dealingBanner: {
    position: "absolute",
    top: "6%",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 2,
    zIndex: 45,
  },
  dealingTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.display,
    fontSize: 22,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  dealingMessageText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 13,
  },
});
