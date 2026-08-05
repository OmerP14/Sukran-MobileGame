import { Text } from "react-native";
import type { CurrencySystem } from "../constants/lobby";
import { LokumIcon } from "./LokumIcon";

interface CurrencyIconProps {
  system: CurrencySystem;
  size?: number;
}

export function CurrencyIcon({ system, size = 20 }: CurrencyIconProps) {
  if (system === "lokum") {
    return <LokumIcon size={size} />;
  }
  return <Text style={{ fontSize: size }}>🏆</Text>;
}
