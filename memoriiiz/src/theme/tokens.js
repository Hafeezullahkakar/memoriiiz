// ─────────────────────────────────────────────────────────────────────────
// Design tokens — the single source of truth for colors, gradients, radii,
// shadows and typography across the app. Change values here and every page
// picks them up.
//
// To recolor the app: edit PALETTE (per mode) or GRADIENTS below.
// To resize corners: edit RADII.
// To retone shadows: edit SHADOWS.
// ─────────────────────────────────────────────────────────────────────────

import { useTheme } from "@mui/material/styles";

// Tight, modern radii — no pillowy bubble look.
export const RADII = {
  none: 0,
  sm: 3,
  md: 5,
  lg: 7,
  xl: 10,
  xxl: 14,
  pill: 999, // for progress bars only
};

export const FONT = {
  family: "'Poppins', sans-serif",
  weightBody: 500,
  weightMedium: 600,
  weightBold: 700,
  weightHeavy: 800,
  weightBlack: 900,
};

// Young + energetic: electric violet primary, hot coral accent, emerald for done.
export const PALETTE = {
  light: {
    primary: "#7C3AED",           // violet-600 — buttons, links, active states
    primaryDark: "#6D28D9",
    primarySoft: "#EDE9FE",       // violet-100

    accent: "#F43F5E",            // rose-500 — energy, streaks, "toLearn"
    accentDark: "#E11D48",
    accentSoft: "#FFE4E6",        // rose-100

    bg: "#FAFAFF",                // very light violet-tinted white
    surface: "#FFFFFF",
    surfaceSoft: "#F5F3FF",       // violet-50

    text: "#1E1B4B",              // indigo-950 — deep with hint of violet
    textMuted: "#64748B",         // slate-500
    textFaint: "#94A3B8",

    border: "#E5E7EB",
    borderStrong: "#C7D2FE",      // violet-200 tint
    hover: "rgba(124, 58, 237, 0.06)",

    known: "#10B981",             // emerald-500 — stays green (done)
    knownSoft: "#D1FAE5",
    knownBorder: "#6EE7B7",

    toLearn: "#F43F5E",           // reuses accent — coral
    toLearnSoft: "#FFE4E6",
    toLearnBorder: "#FCA5A5",

    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
  },
  dark: {
    primary: "#A78BFA",           // violet-400 — brighter on dark bg
    primaryDark: "#8B5CF6",
    primarySoft: "rgba(167, 139, 250, 0.16)",

    accent: "#FB7185",            // rose-400 — warmer for dark
    accentDark: "#F43F5E",
    accentSoft: "rgba(251, 113, 133, 0.16)",

    bg: "#0F0A1F",                // very dark violet-tinted
    surface: "#1A1235",           // deep violet
    surfaceSoft: "#150E28",

    text: "#F8FAFC",
    textMuted: "#94A3B8",
    textFaint: "#64748B",

    border: "#2A1F4F",
    borderStrong: "#3B2E5F",
    hover: "rgba(167, 139, 250, 0.08)",

    known: "#34D399",
    knownSoft: "rgba(52, 211, 153, 0.15)",
    knownBorder: "rgba(52, 211, 153, 0.4)",

    toLearn: "#FB7185",
    toLearnSoft: "rgba(251, 113, 133, 0.15)",
    toLearnBorder: "rgba(251, 113, 133, 0.4)",

    danger: "#F87171",
    dangerSoft: "rgba(248, 113, 113, 0.15)",
  },
};

// Vibrant gradients — used for hero surfaces, primary CTAs, celebratory bits.
export const GRADIENTS = {
  hero: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F43F5E 100%)",
  primary: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
  accent: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
  toLearn: "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
  known: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  danger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
  playful: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
  warmSurface: "linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)",
};

export const SHADOWS = {
  xs: "0 1px 2px rgba(30, 27, 75, 0.05)",
  sm: "0 1px 3px rgba(30, 27, 75, 0.08), 0 1px 2px rgba(30, 27, 75, 0.04)",
  md: "0 4px 14px rgba(30, 27, 75, 0.10)",
  lg: "0 16px 36px rgba(30, 27, 75, 0.16)",
  primary: "0 6px 18px rgba(124, 58, 237, 0.35)",
  accent: "0 6px 18px rgba(244, 63, 94, 0.30)",
  known: "0 6px 18px rgba(16, 185, 129, 0.28)",
  glow: "0 0 24px rgba(236, 72, 153, 0.45)",
};

export const MOTION = {
  fast: "0.12s ease",
  base: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
};

export const buildTokens = (mode = "light") => ({
  radii: RADII,
  colors: PALETTE[mode],
  gradients: GRADIENTS,
  shadows: SHADOWS,
  motion: MOTION,
  font: FONT,
  mode,
});

export const useTokens = () => {
  const theme = useTheme();
  return buildTokens(theme.palette.mode);
};
