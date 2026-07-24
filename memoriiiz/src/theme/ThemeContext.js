import React, { createContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTokens, FONT } from "./tokens";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved || "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", next);
          return next;
        }),
    }),
    []
  );

  const theme = useMemo(() => {
    const t = buildTokens(mode);
    const c = t.colors;
    return createTheme({
      palette: {
        mode,
        primary: { main: c.primary, dark: c.primaryDark, light: c.primarySoft, contrastText: "#fff" },
        secondary: { main: c.accent, light: c.accentSoft, contrastText: "#fff" },
        success: { main: c.known, light: c.knownSoft, dark: c.known, contrastText: "#fff" },
        warning: { main: c.toLearn, light: c.toLearnSoft, dark: c.toLearn, contrastText: "#fff" },
        error: { main: c.danger, light: c.dangerSoft, dark: c.danger, contrastText: "#fff" },
        background: { default: c.bg, paper: c.surface },
        text: { primary: c.text, secondary: c.textMuted, disabled: c.textFaint },
        divider: c.border,
        action: { hover: c.hover },
      },
      shape: { borderRadius: t.radii.md },
      typography: {
        fontFamily: FONT.family,
        h1: { fontWeight: FONT.weightBlack, letterSpacing: "-0.02em" },
        h2: { fontWeight: FONT.weightHeavy, letterSpacing: "-0.02em" },
        h3: { fontWeight: FONT.weightHeavy, letterSpacing: "-0.01em" },
        h4: { fontWeight: FONT.weightHeavy, letterSpacing: "-0.01em" },
        h5: { fontWeight: FONT.weightBold },
        h6: { fontWeight: FONT.weightBold },
        button: { fontWeight: FONT.weightBold, textTransform: "none" },
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor:
                mode === "light" ? "rgba(250, 250, 255, 0.85)" : "rgba(15, 10, 31, 0.85)",
              backdropFilter: "blur(14px)",
              borderBottom: `1px solid ${c.border}`,
              color: c.text,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: t.radii.md, textTransform: "none", fontWeight: FONT.weightBold },
            containedPrimary: { boxShadow: t.shadows.primary },
          },
        },
        MuiPaper: {
          styleOverrides: {
            rounded: { borderRadius: t.radii.md },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: t.radii.sm, fontWeight: FONT.weightBold },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: { borderRadius: t.radii.md },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
