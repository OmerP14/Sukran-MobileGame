import { StyleSheet, Switch, View } from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import type { CardSortOrder } from "../store/settings-store";
import { useSettingsStore } from "../store/settings-store";
import { Section, SegmentedControl } from "./SettingsControls";

const SORT_OPTIONS: { value: CardSortOrder; label: string }[] = [
  { value: "rank", label: "Değere göre" },
  { value: "suit", label: "Türe göre" },
];

// Each player's own preferences, not the table host's to set — opened from
// the gear icon on the game screen so anyone can adjust these mid-game.
export function PlayerSettingsPanel() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  return (
    <View style={styles.content}>
      <Section title="Kart sıralama">
        <SegmentedControl
          options={SORT_OPTIONS}
          value={settings.cardSortOrder}
          onChange={(value) => updateSettings({ cardSortOrder: value })}
        />
      </Section>

      <View style={styles.switchRow}>
        <Section title="Ses">
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
            trackColor={{ true: COLORS.gold, false: COLORS.panel }}
          />
        </Section>

        <Section title="Titreşim">
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
            trackColor={{ true: COLORS.gold, false: COLORS.panel }}
          />
        </Section>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.lg,
    width: "100%",
  },
  switchRow: {
    flexDirection: "row",
    gap: SPACING.xl,
  },
});
