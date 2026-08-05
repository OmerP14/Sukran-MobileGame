import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { GRADIENTS } from "../constants/theme";

interface GradientBackgroundProps {
  children?: ReactNode;
  edges?: Edge[];
}

export function GradientBackground({ children, edges }: GradientBackgroundProps) {
  return (
    <LinearGradient colors={GRADIENTS.felt} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
