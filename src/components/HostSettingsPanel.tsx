import { StyleSheet, Text, View } from "react-native";
import {
  MAX_REQUEST_TIMEOUT_MS,
  MAX_SUKRAN_TIMEOUT_MS,
  MIN_REQUEST_TIMEOUT_MS,
  MIN_SUKRAN_TIMEOUT_MS,
  REQUEST_TIMEOUT_STEP_MS,
  SUKRAN_TIMEOUT_STEP_MS,
} from "../constants/config";
import { CURRENCY_INFO, formatBalance, type CurrencySystem } from "../constants/lobby";
import { SPACING } from "../constants/theme";
import { CurrencyIcon } from "./CurrencyIcon";
import { Section, sharedSettingsStyles, StepperButton } from "./SettingsControls";

interface HostSettingsPanelProps {
  sukranTimeoutMs: number;
  onSukranTimeoutChange: (value: number) => void;
  requestTimeoutMs: number;
  onRequestTimeoutChange: (value: number) => void;
  currency: CurrencySystem;
  stake: number;
  stakeMin: number;
  stakeMax: number;
  stakeStep: number;
  onStakeChange: (value: number) => void;
}

// What the host sets up for this particular table: how long everyone has to
// say Şükran, how long a card request gets before it's forfeited, and how
// much they're playing for. Everything here defaults from the room's tier —
// these are per-table overrides, not a global user preference. Personal
// preferences (sound/haptics/card sort) are each player's own — set from the
// gear icon inside the game screen, not here.
export function HostSettingsPanel({
  sukranTimeoutMs,
  onSukranTimeoutChange,
  requestTimeoutMs,
  onRequestTimeoutChange,
  currency,
  stake,
  stakeMin,
  stakeMax,
  stakeStep,
  onStakeChange,
}: HostSettingsPanelProps) {
  const currencyInfo = CURRENCY_INFO[currency];
  const stakeIsFixed = stakeMin === stakeMax;

  function adjustSukranTimeout(deltaMs: number) {
    const next = Math.min(
      MAX_SUKRAN_TIMEOUT_MS,
      Math.max(MIN_SUKRAN_TIMEOUT_MS, sukranTimeoutMs + deltaMs)
    );
    onSukranTimeoutChange(next);
  }

  function adjustRequestTimeout(deltaMs: number) {
    const next = Math.min(
      MAX_REQUEST_TIMEOUT_MS,
      Math.max(MIN_REQUEST_TIMEOUT_MS, requestTimeoutMs + deltaMs)
    );
    onRequestTimeoutChange(next);
  }

  function adjustStake(deltaAmount: number) {
    const next = Math.min(stakeMax, Math.max(stakeMin, stake + deltaAmount));
    onStakeChange(next);
  }

  return (
    <View style={styles.content}>
      <Section title="Şükran süresi">
        <View style={styles.stepperRow}>
          <StepperButton label="-" onPress={() => adjustSukranTimeout(-SUKRAN_TIMEOUT_STEP_MS)} />
          <Text style={sharedSettingsStyles.stepperValue}>
            {(sukranTimeoutMs / 1000).toFixed(1)} sn
          </Text>
          <StepperButton label="+" onPress={() => adjustSukranTimeout(SUKRAN_TIMEOUT_STEP_MS)} />
        </View>
      </Section>

      <Section title="Kart isteme süresi">
        <View style={styles.stepperRow}>
          <StepperButton
            label="-"
            onPress={() => adjustRequestTimeout(-REQUEST_TIMEOUT_STEP_MS)}
          />
          <Text style={sharedSettingsStyles.stepperValue}>
            {(requestTimeoutMs / 1000).toFixed(0)} sn
          </Text>
          <StepperButton label="+" onPress={() => adjustRequestTimeout(REQUEST_TIMEOUT_STEP_MS)} />
        </View>
      </Section>

      <Section title={`${currencyInfo.name} girişi`}>
        {stakeIsFixed ? (
          <View style={styles.stakeValue}>
            <CurrencyIcon system={currency} size={20} />
            <Text style={sharedSettingsStyles.stepperValue}>{formatBalance(stake)}</Text>
          </View>
        ) : (
          <View style={styles.stepperRow}>
            <StepperButton label="-" onPress={() => adjustStake(-stakeStep)} />
            <View style={styles.stakeValue}>
              <CurrencyIcon system={currency} size={20} />
              <Text style={sharedSettingsStyles.stepperValue}>{formatBalance(stake)}</Text>
            </View>
            <StepperButton label="+" onPress={() => adjustStake(stakeStep)} />
          </View>
        )}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.lg,
    width: "100%",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  stakeValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    minWidth: 100,
    justifyContent: "center",
  },
});
