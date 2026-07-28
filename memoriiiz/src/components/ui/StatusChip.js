import React from "react";
import { Box } from "@mui/material";
import { MdCheckCircle, MdOutlineHourglassEmpty, MdStar } from "react-icons/md";
import { useTokens } from "../../theme/tokens";

/**
 * Small status pill for Known / To Learn / Focus.
 *
 * <StatusChip status="Focus" onClick={...} />
 */
const STATUS_ORDER = ["To Learn", "Focus", "Known"];
export const nextStatus = (current) => {
  const i = STATUS_ORDER.indexOf(current || "To Learn");
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
};

const StatusChip = ({ status, onClick, size = "sm" }) => {
  const t = useTokens();
  const s = String(status || "To Learn");

  let bg, fg, border, Icon;
  if (s === "Known") {
    bg = t.colors.knownSoft;
    fg = t.colors.known;
    border = t.colors.knownBorder;
    Icon = MdCheckCircle;
  } else if (s === "Focus") {
    bg = t.colors.primarySoft;
    fg = t.colors.primary;
    border = t.colors.borderStrong;
    Icon = MdStar;
  } else {
    bg = t.colors.toLearnSoft;
    fg = t.colors.toLearn;
    border = t.colors.toLearnBorder;
    Icon = MdOutlineHourglassEmpty;
  }

  const px = size === "sm" ? 1 : 1.5;
  const py = size === "sm" ? 0.25 : 0.5;
  const fs = size === "sm" ? 10.5 : 12;
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px,
        py,
        borderRadius: t.radii.sm,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        fontWeight: 800,
        fontSize: fs,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: `all ${t.motion.fast}`,
        "&:hover": onClick ? { transform: "translateY(-1px)" } : {},
      }}
    >
      <Icon size={iconSize} />
      {s}
    </Box>
  );
};

export default StatusChip;
