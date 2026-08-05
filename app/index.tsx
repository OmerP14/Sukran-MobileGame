import { router } from "expo-router";
import { useEffect } from "react";
import { GradientBackground } from "../src/components/GradientBackground";
import { useProfileStore } from "../src/store/profile-store";

export default function EntryScreen() {
  const hydrated = useProfileStore((state) => state.hydrated);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    router.replace(profile ? "/lobby" : "/login");
  }, [hydrated, profile]);

  return <GradientBackground />;
}
