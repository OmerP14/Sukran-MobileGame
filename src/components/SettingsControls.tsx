import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../constants/theme";

export const sharedSettingsStyles = StyleSheet.create({
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

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={sharedSettingsStyles.section}>
      <Text style={sharedSettingsStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={sharedSettingsStyles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[sharedSettingsStyles.segment, selected && sharedSettingsStyles.segmentSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                sharedSettingsStyles.segmentText,
                selected && sharedSettingsStyles.segmentTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={sharedSettingsStyles.stepperButton} onPress={onPress}>
      <Text style={sharedSettingsStyles.stepperButtonText}>{label}</Text>
    </Pressable>
  );
}
