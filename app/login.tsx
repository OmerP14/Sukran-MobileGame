import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useProfileStore } from "../src/store/profile-store";

export default function LoginScreen() {
  const loginAsGuest = useProfileStore((state) => state.loginAsGuest);
  const loginWithName = useProfileStore((state) => state.loginWithName);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleGuest() {
    await loginAsGuest();
    router.replace("/lobby");
  }

  function openNameModal() {
    setName("");
    setError(null);
    setNameModalOpen(true);
  }

  async function handleCreateAccount() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const result = await loginWithName(name);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.reason === "taken" ? "Bu isim daha önce alınmış." : "Bir isim gir.");
      return;
    }
    setNameModalOpen(false);
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
            onPress={openNameModal}
          />
        </View>
      </View>

      {nameModalOpen && (
        <Pressable style={styles.modalBackdrop} onPress={() => setNameModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>İsmini Seç</Text>
            <Text style={styles.modalSubtitle}>
              Bu isim arkadaşların seni bulabilmesi için benzersiz olmalı.
            </Text>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError(null);
              }}
              placeholder="İsmin"
              placeholderTextColor={COLORS.textMuted}
              style={styles.nameInput}
              autoFocus
              maxLength={24}
              editable={!submitting}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Pressable
              style={[styles.createButton, submitting && styles.createButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={submitting}
            >
              <Text style={styles.createButtonText}>
                {submitting ? "Kontrol ediliyor…" : "Oluştur"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
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
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 17, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    padding: SPACING.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 20,
    textAlign: "center",
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  errorText: {
    color: "#F0A99E",
    fontSize: 12,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 15,
  },
});
