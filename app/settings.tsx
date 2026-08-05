import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import type { CardSortOrder, Settings } from "../src/store/settings-store";
import { useSettingsStore } from "../src/store/settings-store";
import type { BotDifficulty } from "../src/types/game";

const DIFFICULTY_OPTIONS: { value: BotDifficulty; label: string }[] = [
  { value: "easy", label: "Kolay" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Zor" },
];

const SORT_OPTIONS: { value: CardSortOrder; label: string }[] = [
  { value: "rank", label: "Değere göre" },
  { value: "suit", label: "Türe göre" },
];

const MIN_SUKRAN_TIMEOUT_MS = 1000;
const MAX_SUKRAN_TIMEOUT_MS = 6000;
const SUKRAN_TIMEOUT_STEP_MS = 500;

export default function SettingsScreen() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  function patch(partial: Partial<Settings>) {
    updateSettings(partial);
  }

  function adjustSukranTimeout(deltaMs: number) {
    const next = Math.min(
      MAX_SUKRAN_TIMEOUT_MS,
      Math.max(MIN_SUKRAN_TIMEOUT_MS, settings.sukranTimeoutMs + deltaMs)
    );
    patch({ sukranTimeoutMs: next });
  }

  return (
    <GradientBackground edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Bot zorluk seviyesi">
          <SegmentedControl
            options={DIFFICULTY_OPTIONS}
            value={settings.botDifficulty}
            onChange={(value) => patch({ botDifficulty: value })}
          />
        </Section>

        <Section title="Şükran süresi">
          <View style={styles.stepperRow}>
            <StepperButton label="-" onPress={() => adjustSukranTimeout(-SUKRAN_TIMEOUT_STEP_MS)} />
            <Text style={styles.stepperValue}>
              {(settings.sukranTimeoutMs / 1000).toFixed(1)} sn
            </Text>
            <StepperButton label="+" onPress={() => adjustSukranTimeout(SUKRAN_TIMEOUT_STEP_MS)} />
          </View>
        </Section>

        <Section title="Ses">
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => patch({ soundEnabled: value })}
            trackColor={{ true: COLORS.gold, false: COLORS.panel }}
          />
        </Section>

        <Section title="Titreşim">
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => patch({ hapticsEnabled: value })}
            trackColor={{ true: COLORS.gold, false: COLORS.panel }}
          />
        </Section>

        <Section title="Kart sıralama">
          <SegmentedControl
            options={SORT_OPTIONS}
            value={settings.cardSortOrder}
            onChange={(value) => patch({ cardSortOrder: value })}
          />
        </Section>
      </ScrollView>
    </GradientBackground>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.stepperButton} onPress={onPress}>
      <Text style={styles.stepperButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.heading,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: COLORS.feltBottom,
    borderRadius: RADIUS.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: RADIUS.pill,
  },
  segmentSelected: {
    backgroundColor: COLORS.gold,
  },
  segmentText: {
    color: COLORS.cream,
    fontWeight: "600",
    fontSize: 13,
  },
  segmentTextSelected: {
    color: COLORS.feltBottom,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: "700",
  },
  stepperValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 64,
    textAlign: "center",
  },
});
