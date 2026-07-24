import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { MdSportsEsports, MdLibraryBooks, MdAutoFixHigh, MdArrowForward } from "react-icons/md";
import Hero from "../components/hero/Hero";
import { useTokens } from "../theme/tokens";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const FEATURES = [
  {
    key: "words",
    to: "/words",
    icon: <MdLibraryBooks size={24} />,
    title: "Word Library",
    desc: "Every word you're learning — searchable, filterable, sortable A-Z.",
  },
  {
    key: "play",
    to: "/play",
    icon: <MdSportsEsports size={24} />,
    title: "Play & Test",
    desc: "Fast quizzes with hearts and streaks. See what really stuck.",
  },
  {
    key: "practice",
    to: "/practice",
    icon: <MdAutoFixHigh size={24} />,
    title: "AI Paragraphs",
    desc: "Generate reading passages packed with your to-learn words.",
  },
];

const Homepage = () => {
  const t = useTokens();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/getAllWords`);
        if (!alive) return;
        const total = res.data?.length || 0;
        const known = res.data?.filter((w) => w.status === "Known").length || 0;
        setCounts({ total, known, toLearn: total - known });
      } catch (e) {
        // best-effort; homepage should still render
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box sx={{ bgcolor: t.colors.bg }}>
      <Hero />

      {/* Live stats strip */}
      {counts && counts.total > 0 && (
        <Box sx={{ bgcolor: t.colors.surface, borderY: `1px solid ${t.colors.border}`, py: 3 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: { xs: 1, sm: 3 },
                textAlign: "center",
              }}
            >
              <Stat label="Total Words" value={counts.total} />
              <Stat label="Known" value={counts.known} accent={t.colors.known} />
              <Stat label="To Learn" value={counts.toLearn} accent={t.colors.toLearn} />
            </Box>
          </Container>
        </Box>
      )}

      {/* Feature cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography sx={{ color: t.colors.primary, fontWeight: 800, fontSize: 12, letterSpacing: 1.5, mb: 1 }}>
            EVERYTHING YOU NEED
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.02em", fontSize: { xs: 28, md: 36 } }}>
            Three ways to learn.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {FEATURES.map((f) => (
            <Box
              key={f.key}
              component={Link}
              to={f.to}
              sx={{
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                color: "inherit",
                p: { xs: 3, md: 4 },
                borderRadius: t.radii.xl,
                bgcolor: t.colors.surface,
                border: `1px solid ${t.colors.border}`,
                transition: `all ${t.motion.base}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: t.colors.primary,
                  boxShadow: t.shadows.md,
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: t.radii.md,
                  background: t.colors.primarySoft,
                  color: t.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {f.icon}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 1 }}>{f.title}</Typography>
              <Typography sx={{ color: t.colors.textMuted, fontSize: 14.5, lineHeight: 1.55, mb: 2 }}>
                {f.desc}
              </Typography>
              <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 0.5, color: t.colors.primary, fontWeight: 800, fontSize: 14 }}>
                Open <MdArrowForward />
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA band */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: t.radii.xxl,
              background: t.gradients.hero,
              color: "#fff",
              textAlign: "center",
              boxShadow: t.shadows.lg,
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 32 }, mb: 1 }}>
              Add a word. Learn it forever.
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 3, fontSize: { xs: 14, md: 16 } }}>
              Contribute to your word list and revisit it any time.
            </Typography>
            <Button
              component={Link}
              to="/addword"
              size="large"
              variant="contained"
              sx={{
                bgcolor: "#fff",
                color: t.colors.primary,
                fontWeight: 800,
                px: 4,
                py: 1.5,
                borderRadius: t.radii.md,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#fff", opacity: 0.95 },
              }}
            >
              Add a Word
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

const Stat = ({ label, value, accent }) => {
  const t = useTokens();
  return (
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, sm: 32 }, color: accent || t.colors.text, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value.toLocaleString()}
      </Typography>
      <Typography sx={{ color: t.colors.textMuted, fontSize: { xs: 11, sm: 13 }, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
};

export default Homepage;
