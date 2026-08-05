import { Cinzel_500Medium, Cinzel_600SemiBold, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { CinzelDecorative_700Bold } from "@expo-google-fonts/cinzel-decorative";
import { setAudioModeAsync } from "expo-audio";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { auth } from "../src/config/firebase";
import { COLORS } from "../src/constants/theme";
import { useProfileStore } from "../src/store/profile-store";
import { useSettingsStore } from "../src/store/settings-store";
import { preloadSounds } from "../src/utils/sound";

export default function RootLayout() {
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const syncWithAuthUser = useProfileStore((state) => state.syncWithAuthUser);
  const [fontsLoaded] = useFonts({
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    CinzelDecorative_700Bold,
  });

  useEffect(() => {
    hydrateSettings();
    // Firebase Auth is the source of truth for "who's signed in" — this
    // fires once with whatever session was restored from AsyncStorage (or
    // null), then again on every future sign-in/sign-out.
    const unsubscribe = onAuthStateChanged(auth, syncWithAuthUser);
    // So sound effects still play with the iOS silent switch on — expected
    // for a game, unlike a media app that should respect it.
    setAudioModeAsync({ playsInSilentMode: true });
    // Load every sound now, at app start, so rarely-used ones (a Şükran
    // timeout, a failed request) aren't silently skipped the first time
    // they're needed because their player hadn't finished loading yet.
    preloadSounds();
    return unsubscribe;
  }, [hydrateSettings, syncWithAuthUser]);

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
        <Stack.Screen name="statistics" options={{ title: "İstatistikler" }} />
        <Stack.Screen name="friends" options={{ title: "Arkadaşlar" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
