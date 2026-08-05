import { Cinzel_500Medium, Cinzel_600SemiBold, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { CinzelDecorative_700Bold } from "@expo-google-fonts/cinzel-decorative";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "../src/constants/theme";
import { useProfileStore } from "../src/store/profile-store";
import { useSettingsStore } from "../src/store/settings-store";

export default function RootLayout() {
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydrateProfile = useProfileStore((state) => state.hydrate);
  const [fontsLoaded] = useFonts({
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    CinzelDecorative_700Bold,
  });

  useEffect(() => {
    hydrateSettings();
    hydrateProfile();
  }, [hydrateSettings, hydrateProfile]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.feltMid }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.feltBottom },
          headerTintColor: COLORS.cream,
          headerTitleStyle: { fontFamily: "Cinzel_600SemiBold", fontSize: 16 },
          contentStyle: { backgroundColor: COLORS.feltMid },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="lobby" options={{ headerShown: false }} />
        <Stack.Screen name="rooms" options={{ headerShown: false }} />
        <Stack.Screen name="game" options={{ headerShown: false }} />
        <Stack.Screen name="result" options={{ headerShown: false }} />
        <Stack.Screen name="rules" options={{ title: "Nasıl Oynanır?" }} />
        <Stack.Screen name="settings" options={{ title: "Ayarlar" }} />
        <Stack.Screen name="statistics" options={{ title: "İstatistikler" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
