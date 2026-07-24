import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { MdArrowForward, MdSportsEsports, MdAutoAwesome } from "react-icons/md";
import { useTokens } from "../../theme/tokens";

/**
 * Homepage hero — single focused screen with headline, tagline, two CTAs,
 * and a decorative preview panel on the right (desktop).
 */
const SAMPLE_WORDS = [
  { w: "ubiquitous", m: "present everywhere" },
  { w: "ephemeral", m: "lasting a very short time" },
  { w: "sanguine", m: "optimistic, cheerful" },
  { w: "laconic", m: "using few words" },
  { w: "quixotic", m: "impractical, idealistic" },
];

function Hero() {
  const t = useTokens();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: t.colors.bg,
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        backgroundImage:
          t.mode === "dark"
            ? "radial-gradient(circle at 15% 0%, rgba(129,140,248,0.12) 0%, transparent 45%), radial-gradient(circle at 90% 100%, rgba(167,139,250,0.10) 0%, transparent 45%)"
            : "radial-gradient(circle at 15% 0%, rgba(79,70,229,0.07) 0%, transparent 45%), radial-gradient(circle at 90% 100%, rgba(139,92,246,0.06) 0%, transparent 45%)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gap: { xs: 5, md: 6 },
            gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
            alignItems: "center",
          }}
        >
          {/* Left — copy */}
          <Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: t.radii.sm,
                bgcolor: t.colors.primarySoft,
                color: t.colors.primary,
                mb: 2,
                border: `1px solid ${t.colors.primarySoft}`,
              }}
            >
              <MdAutoAwesome size={14} />
              <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>
                Learn words that stick
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 36, sm: 46, md: 56 },
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                mb: 2,
              }}
            >
              Build vocabulary
              <br />
              that actually{" "}
              <Box
                component="span"
                sx={{
                  color: t.colors.accent,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "0.08em",
                    height: "0.28em",
                    background: t.colors.accentSoft,
                    zIndex: -1,
                    borderRadius: 1,
                  },
                }}
              >
                sticks.
              </Box>
            </Typography>

            <Typography
              sx={{
                color: t.colors.textMuted,
                fontSize: { xs: 15, md: 17 },
                lineHeight: 1.6,
                mb: 4,
                maxWidth: 520,
              }}
            >
              Flashcards, quick quizzes, and AI-generated practice paragraphs — all in one calm, fast app. No streaks-guilt, no fluff.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={Link}
                to="/words"
                variant="contained"
                size="large"
                endIcon={<MdArrowForward />}
                sx={{
                  background: t.gradients.primary,
                  boxShadow: t.shadows.primary,
                  px: 3.5,
                  py: 1.5,
                  fontSize: 15,
                  borderRadius: t.radii.md,
                }}
              >
                Browse Words
              </Button>
              <Button
                component={Link}
                to="/play"
                variant="outlined"
                size="large"
                startIcon={<MdSportsEsports />}
                sx={{
                  px: 3.5,
                  py: 1.5,
                  fontSize: 15,
                  borderRadius: t.radii.md,
                  borderColor: t.colors.borderStrong,
                  color: t.colors.text,
                  "&:hover": { borderColor: t.colors.primary, bgcolor: t.colors.primarySoft },
                }}
              >
                Play Quiz
              </Button>
            </Stack>
          </Box>

          {/* Right — decorative preview */}
          <Box sx={{ display: { xs: "none", md: "block" }, position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: t.gradients.hero,
                filter: "blur(60px)",
                opacity: 0.18,
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "relative",
                borderRadius: t.radii.xxl,
                background: t.colors.surface,
                border: `1px solid ${t.colors.border}`,
                boxShadow: t.shadows.lg,
                p: 3,
                zIndex: 1,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", color: t.colors.textMuted, letterSpacing: 1.2, mb: 2 }}>
                Today's picks
              </Typography>
              <Stack spacing={1}>
                {SAMPLE_WORDS.map((s, i) => (
                  <Box
                    key={s.w}
                    sx={{
                      p: 1.5,
                      borderRadius: t.radii.md,
                      border: `1px solid ${t.colors.border}`,
                      background: i === 0 ? t.colors.primarySoft : t.colors.bg,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: t.radii.sm,
                        background: i === 0 ? t.gradients.primary : t.colors.surface,
                        color: i === 0 ? "#fff" : t.colors.textMuted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {s.w[0].toUpperCase()}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>{s.w}</Typography>
                      <Typography sx={{ color: t.colors.textMuted, fontSize: 12.5 }}>{s.m}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;
