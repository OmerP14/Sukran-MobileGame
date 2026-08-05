import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useProfileStore } from "../src/store/profile-store";

const NAME_ADJECTIVES = ["Şanslı", "Cesur", "Hızlı", "Akıllı", "Sadık", "Neşeli", "Cömert"];

function randomLocalName(): string {
  const adjective = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${adjective}Oyuncu${suffix}`;
}

export default function LoginScreen() {
  const loginAsGuest = useProfileStore((state) => state.loginAsGuest);
  const loginWithName = useProfileStore((state) => state.loginWithName);

  async function handleGuest() {
    await loginAsGuest();
    router.replace("/lobby");
  }

  async function handleCreateAccount() {
    await loginWithName(randomLocalName());
    router.replace("/lobby");
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={styles.suits}>♠ ♥ ♦ ♣</Text>
          <Text style={styles.title}>Şükran</Text>
          <View style={styles.rule} />
          <Text style={styles.subtitle}>Dörtlü toplama kart oyunu</Text>
        </View>

        <View style={styles.authColumn}>
          <AuthButton label="Facebook ile Giriş Yap" icon="f" iconColor="#1877F2" comingSoon />
          <AuthButton label="Apple ile Giriş Yap" icon="" iconColor="#111111" comingSoon />
          <AuthButton
            label="Misafir Girişi"
            icon="👤"
            iconColor={COLORS.mintDim}
            onPress={handleGuest}
          />
          <AuthButton
            label="Hesap Oluştur"
            icon="★"
            iconColor={COLORS.goldDeep}
            primary
            onPress={handleCreateAccount}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

interface AuthButtonProps {
  label: string;
  icon: string;
  iconColor: string;
  primary?: boolean;
  comingSoon?: boolean;
  onPress?: () => void;
}

function AuthButton({ label, icon, iconColor, primary, comingSoon, onPress }: AuthButtonProps) {
  return (
    <Pressable
      style={[
        styles.authButton,
        primary && styles.authButtonPrimary,
        comingSoon && styles.authButtonDisabled,
      ]}
      onPress={onPress}
      disabled={comingSoon}
    >
      <Text style={[styles.authButtonText, primary && styles.authButtonTextPrimary]}>{label}</Text>
      <View style={[styles.authIcon, { backgroundColor: iconColor }]}>
        <Text style={styles.authIconText}>{icon}</Text>
      </View>
      {comingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>ÇOK YAKINDA</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  titleBlock: {
    alignItems: "center",
  },
  suits: {
    color: COLORS.panelBorder,
    fontSize: 20,
    letterSpacing: 8,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 64,
    color: COLORS.goldBright,
    fontFamily: FONTS.display,
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  rule: {
    width: 72,
    height: 3,
    backgroundColor: COLORS.gold,
    marginTop: SPACING.md,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  authColumn: {
    gap: SPACING.md,
    width: 340,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  authButtonPrimary: {
    borderColor: COLORS.gold,
    backgroundColor: "rgba(212, 175, 55, 0.14)",
  },
  authButtonDisabled: {
    opacity: 0.5,
  },
  authButtonText: {
    color: COLORS.cream,
    fontFamily: FONTS.heading,
    fontSize: 17,
    flex: 1,
  },
  authButtonTextPrimary: {
    color: COLORS.goldBright,
  },
  authIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.md,
  },
  authIconText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 19,
  },
  comingSoonBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
