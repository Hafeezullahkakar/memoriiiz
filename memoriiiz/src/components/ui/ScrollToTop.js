import React, { useEffect, useState } from "react";
import { Box, Fade, IconButton } from "@mui/material";
import { MdArrowUpward } from "react-icons/md";
import { useTokens } from "../../theme/tokens";

/**
 * Floating "back to top" button.
 * Appears after the user scrolls SHOW_AFTER pixels down; click smooth-scrolls
 * to the top. Mounted once at the app root.
 */
const SHOW_AFTER = 320;

const ScrollToTop = () => {
  const t = useTokens();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // check initial position
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Fade in={visible}>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1200,
        }}
      >
        <IconButton
          onClick={scrollUp}
          aria-label="Scroll to top"
          sx={{
            width: 44,
            height: 44,
            borderRadius: t.radii.md,
            color: "#fff",
            background: t.gradients.primary,
            boxShadow: t.shadows.primary,
            transition: `transform ${t.motion.base}, box-shadow ${t.motion.base}`,
            "&:hover": {
              background: t.gradients.primary,
              transform: "translateY(-2px)",
              boxShadow: t.shadows.lg,
            },
            "&:active": { transform: "scale(0.96)" },
          }}
        >
          <MdArrowUpward size={22} />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ScrollToTop;
