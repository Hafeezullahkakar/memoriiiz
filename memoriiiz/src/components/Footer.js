import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, Typography, Stack } from "@mui/material";
import { useTokens } from "../theme/tokens";
import LogoMark from "./LogoMark";

const linkStyle = (t) => ({
  color: t.colors.textMuted,
  fontSize: 14,
  textDecoration: "none",
  fontWeight: 600,
  transition: `color ${t.motion.fast}`,
  "&:hover": { color: t.colors.primary },
});

function Footer() {
  const t = useTokens();

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 5, md: 6 },
        px: 2,
        mt: "auto",
        bgcolor: t.colors.surface,
        borderTop: `1px solid ${t.colors.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
          }}
        >
          <Box>
            <Box sx={{ mb: 1.5 }}>
              <LogoMark size={28} wordmarkSize={17} />
            </Box>
            <Typography sx={{ color: t.colors.textMuted, fontSize: 14, lineHeight: 1.6, maxWidth: 340 }}>
              Build vocabulary that sticks. Flashcards, quick quizzes and AI reading practice — all in one calm place.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", mb: 1.5, color: t.colors.text }}>
              Product
            </Typography>
            <Stack spacing={1}>
              <Box component={Link} to="/words" sx={linkStyle(t)}>Words</Box>
              <Box component={Link} to="/play" sx={linkStyle(t)}>Play</Box>
              <Box component={Link} to="/practice" sx={linkStyle(t)}>Practice</Box>
              <Box component={Link} to="/addword" sx={linkStyle(t)}>Add Word</Box>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", mb: 1.5, color: t.colors.text }}>
              Company
            </Typography>
            <Stack spacing={1}>
              <Box component={Link} to="/about" sx={linkStyle(t)}>About</Box>
              <Box component={Link} to="/askai" sx={linkStyle(t)}>Ask AI</Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${t.colors.border}`, textAlign: "center" }}>
          <Typography sx={{ color: t.colors.textFaint, fontSize: 13 }}>
            © {new Date().getFullYear()} Memoriiiz
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
