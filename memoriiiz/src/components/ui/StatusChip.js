import React from "react";
import { Box } from "@mui/material";
import { MdCheckCircle, MdOutlineHourglassEmpty } from "react-icons/md";
import { useTokens } from "../../theme/tokens";

/**
 * Small status pill for "Known" / "To Learn".
 *
 * <StatusChip status="Known" onClick={...} />
 */
const StatusChip = ({ status, onClick, size = "sm" }) => {
  const t = useTokens();
  const known = status === "Known";
  const bg = known ? t.colors.knownSoft : t.colors.toLearnSoft;
  const fg = known ? t.colors.known : t.colors.toLearn;
  const border = known ? t.colors.knownBorder : t.colors.toLearnBorder;

  const px = size === "sm" ? 1 : 1.5;
  const py = size === "sm" ? 0.25 : 0.5;
  const fs = size === "sm" ? 10.5 : 12;

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
      {known ? <MdCheckCircle size={size === "sm" ? 12 : 14} /> : <MdOutlineHourglassEmpty size={size === "sm" ? 12 : 14} />}
      {status || "To Learn"}
    </Box>
  );
};

export default StatusChip;
