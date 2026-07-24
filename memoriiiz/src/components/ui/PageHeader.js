import React from "react";
import { Box, Typography } from "@mui/material";
import { useTokens } from "../../theme/tokens";

/**
 * A consistent page header: title, subtitle and a strip of stat pills.
 *
 * <PageHeader
 *   title="Words"
 *   subtitle="Everything you're learning, in one place."
 *   stats={[
 *     { label: 'Total', value: 421 },
 *     { label: 'Known', value: 89, tone: 'known' },
 *     { label: 'To Learn', value: 332, tone: 'toLearn' },
 *   ]}
 * />
 */
const StatPill = ({ label, value, tone }) => {
  const t = useTokens();
  const toneMap = {
    known: { bg: t.colors.knownSoft, fg: t.colors.known, border: t.colors.knownBorder },
    toLearn: { bg: t.colors.toLearnSoft, fg: t.colors.toLearn, border: t.colors.toLearnBorder },
    primary: { bg: t.colors.primarySoft, fg: t.colors.primary, border: t.colors.primarySoft },
    neutral: { bg: t.colors.surfaceSoft, fg: t.colors.text, border: t.colors.border },
  };
  const s = toneMap[tone] || toneMap.neutral;
  return (
    <Box
      sx={{
        px: 1.75,
        py: 0.75,
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.75,
        borderRadius: t.radii.sm,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.fg,
      }}
    >
      <Typography component="span" sx={{ fontWeight: 800, fontSize: { xs: 14, sm: 15 } }}>
        {value}
      </Typography>
      <Typography component="span" sx={{ fontWeight: 600, fontSize: { xs: 11, sm: 12 }, opacity: 0.85 }}>
        {label}
      </Typography>
    </Box>
  );
};

const PageHeader = ({ title, subtitle, stats = [], right = null, dense = false }) => {
  return (
    <Box sx={{ mb: dense ? 2 : 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: subtitle || stats.length ? 1 : 0,
        }}
      >
        <Typography
          variant={dense ? "h5" : "h4"}
          sx={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          {title}
        </Typography>
        {right}
      </Box>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mb: stats.length ? 2 : 0, fontSize: { xs: 14, sm: 15 } }}>
          {subtitle}
        </Typography>
      )}
      {stats.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {stats.map((s, i) => (
            <StatPill key={i} {...s} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
