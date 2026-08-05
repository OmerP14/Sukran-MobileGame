export const COLORS = {
  feltTop: "#12583A",
  feltMid: "#0B3D2E",
  feltBottom: "#03110C",
  panel: "#0E4536",
  panelBorder: "rgba(212, 175, 55, 0.35)",
  gold: "#D4AF37",
  goldBright: "#F1D579",
  goldDeep: "#8B6B1F",
  cream: "#F5E6C8",
  textPrimary: "#F5E6C8",
  textMuted: "#9FBDAE",
  cardFace: "#FBF8F1",
  cardBackTop: "#8A2432",
  cardBackBottom: "#450D15",
  suitRed: "#B3223A",
  suitBlack: "#161616",
  success: "#3FAE64",
  danger: "#C0392B",
  overlay: "rgba(3, 17, 12, 0.88)",
  shadow: "rgba(2, 10, 7, 0.55)",
  glow: "rgba(241, 213, 121, 0.55)",
  mint: "#2FE8C0",
  mintDim: "#1B8F73",
  mintGlow: "rgba(47, 232, 192, 0.6)",
  slate: "#0C2620",
};

export const GRADIENTS = {
  felt: [COLORS.feltTop, COLORS.feltMid, COLORS.feltBottom] as const,
  goldButton: [COLORS.goldBright, COLORS.gold] as const,
  cardBack: [COLORS.cardBackTop, COLORS.cardBackBottom] as const,
  panel: ["rgba(255,255,255,0.06)", "rgba(255,255,255,0)"] as const,
};

export const FONTS = {
  display: "CinzelDecorative_700Bold",
  heading: "Cinzel_600SemiBold",
  headingBold: "Cinzel_700Bold",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};
