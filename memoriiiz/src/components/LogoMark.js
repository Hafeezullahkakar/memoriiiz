import React, { useId } from "react";
import { Box, Typography } from "@mui/material";
import { useTokens } from "../theme/tokens";

/**
 * Brand mark:
 *   [ M ]  Memoriiiz.
 *
 * A sharp-cornered slab with a stroked M and an accent-color dot.
 * Light mode: solid violet badge, white stroke, coral dot.
 * Dark mode:  violet→pink→coral gradient badge with a soft glow — pops on
 * the deep-violet dark background.
 */
const LogoMark = ({ size = 30, showWordmark = true, wordmarkSize = 20 }) => {
  const t = useTokens();
  const gradId = useId();

  // Badge gradient stops — swaps for a more dramatic sweep in dark mode.
  const stops =
    t.mode === "dark"
      ? [
          { offset: "0%", color: "#7C3AED" },
          { offset: "50%", color: "#EC4899" },
          { offset: "100%", color: "#F43F5E" },
        ]
      : [
          { offset: "0%", color: "#7C3AED" },
          { offset: "100%", color: "#6D28D9" },
        ];

  const dotColor = t.mode === "dark" ? "#FDE047" : "#F43F5E"; // yellow pop on dark, coral on light
  const glow = t.mode === "dark" ? "drop-shadow(0 0 10px rgba(236, 72, 153, 0.55))" : "none";

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.25 }}>
      <Box
        sx={{
          display: "inline-flex",
          filter: glow,
          transition: "filter 0.25s ease",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`mmz-bg-${gradId}`} x1="0" y1="0" x2="1" y2="1">
              {stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="6" fill={`url(#mmz-bg-${gradId})`} />
          {/* Bold outlined M */}
          <path
            d="M6 24 L6 8 L16 20 L26 8 L26 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          {/* Accent dot */}
          <circle cx="26" cy="24" r="2.2" fill={dotColor} />
        </svg>
      </Box>

      {showWordmark && (
        <Typography
          component="span"
          sx={{
            fontWeight: 900,
            fontSize: wordmarkSize,
            letterSpacing: "-0.03em",
            color: t.colors.text,
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "baseline",
            gap: 0.25,
          }}
        >
          Memoriiiz
          <Box component="span" sx={{ color: t.colors.accent, fontWeight: 900 }}>.</Box>
        </Typography>
      )}
    </Box>
  );
};

export default LogoMark;
