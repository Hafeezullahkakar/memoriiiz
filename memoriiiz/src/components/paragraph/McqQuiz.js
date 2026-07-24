import React, { useState, useMemo } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { MdCheckCircle, MdCancel, MdRefresh } from "react-icons/md";
import { useTokens } from "../../theme/tokens";

/**
 * Client-side GRE-MCQ solver used inside ParagraphView.
 * State is per-mount (fresh on each visit to the paragraph). A Clear button
 * resets answers so users can re-attempt.
 *
 * Props:
 *   mcqs: [{ question, options: string[4], correctIndex: 0..3, explanation }]
 */
const McqQuiz = ({ mcqs }) => {
  const t = useTokens();
  const [answers, setAnswers] = useState({}); // { [idx]: selectedOptionIdx }

  const total = mcqs?.length || 0;
  const answered = Object.keys(answers).length;
  const correct = useMemo(
    () => mcqs.filter((q, i) => answers[i] !== undefined && answers[i] === q.correctIndex).length,
    [mcqs, answers]
  );
  const done = answered === total && total > 0;

  const choose = (qIdx, optIdx) => {
    if (answers[qIdx] !== undefined) return; // lock after first pick
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const clear = () => setAnswers({});

  if (!total) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: t.radii.md,
        border: `1px solid ${t.colors.border}`,
        bgcolor: t.colors.surface,
        mt: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, letterSpacing: 1, color: t.colors.primary, display: "block", lineHeight: 1 }}
          >
            GRE-Style MCQs
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 }, mt: 0.5 }}>
            {total} questions on this passage
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: t.radii.sm,
              border: `1px solid ${done ? t.colors.known : t.colors.border}`,
              background: done ? t.colors.knownSoft : t.colors.surfaceSoft,
              display: "inline-flex",
              alignItems: "baseline",
              gap: 0.5,
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: 16, color: done ? t.colors.known : t.colors.text }}>
              {correct}
            </Typography>
            <Typography sx={{ color: t.colors.textMuted, fontSize: 12, fontWeight: 700 }}>
              / {total} correct
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={clear}
            disabled={answered === 0}
            startIcon={<MdRefresh />}
            sx={{
              borderRadius: t.radii.md,
              fontWeight: 700,
              color: t.colors.textMuted,
              "&:hover": { bgcolor: t.colors.hover, color: t.colors.text },
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: 6, borderRadius: t.radii.pill, bgcolor: t.colors.hover, overflow: "hidden", mb: 3 }}>
        <Box
          sx={{
            height: "100%",
            width: `${(answered / total) * 100}%`,
            background: t.gradients.primary,
            borderRadius: t.radii.pill,
            transition: `width ${t.motion.slow}`,
          }}
        />
      </Box>

      {/* Questions */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {mcqs.map((q, qIdx) => {
          const picked = answers[qIdx];
          const locked = picked !== undefined;
          const rightPick = locked && picked === q.correctIndex;

          return (
            <Box key={qIdx}>
              <Box sx={{ display: "flex", gap: 1, mb: 1.25, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: t.radii.sm,
                    background: locked
                      ? rightPick
                        ? t.colors.known
                        : t.colors.accent
                      : t.colors.primarySoft,
                    color: locked ? "#fff" : t.colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {qIdx + 1}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 15.5 }, lineHeight: 1.45, flex: 1 }}>
                  {q.question}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: { xs: 0, sm: 4.5 } }}>
                {q.options.map((opt, oIdx) => {
                  const isPicked = picked === oIdx;
                  const isRight = oIdx === q.correctIndex;

                  let bg = t.colors.surface;
                  let border = t.colors.border;
                  let color = t.colors.text;

                  if (locked) {
                    if (isRight) {
                      bg = t.colors.knownSoft;
                      border = t.colors.known;
                    } else if (isPicked) {
                      bg = t.colors.dangerSoft;
                      border = t.colors.danger;
                    } else {
                      color = t.colors.textMuted;
                    }
                  } else if (isPicked) {
                    border = t.colors.primary;
                  }

                  return (
                    <Box
                      key={oIdx}
                      onClick={() => choose(qIdx, oIdx)}
                      sx={{
                        cursor: locked ? "default" : "pointer",
                        borderRadius: t.radii.md,
                        border: `1.5px solid ${border}`,
                        background: bg,
                        color,
                        p: { xs: 1, sm: 1.25 },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        transition: `all ${t.motion.fast}`,
                        "&:hover": locked
                          ? {}
                          : {
                              borderColor: t.colors.primary,
                              background: t.colors.primarySoft,
                            },
                      }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: t.radii.sm,
                          border: `1px solid ${border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 12,
                          bgcolor: locked && isRight ? t.colors.known : locked && isPicked ? t.colors.danger : "transparent",
                          color: locked && (isRight || isPicked) ? "#fff" : color,
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </Box>
                      <Typography sx={{ fontSize: { xs: 13.5, sm: 14 }, lineHeight: 1.4, flex: 1 }}>
                        {opt}
                      </Typography>
                      {locked && isRight && <MdCheckCircle size={18} color={t.colors.known} />}
                      {locked && isPicked && !isRight && <MdCancel size={18} color={t.colors.danger} />}
                    </Box>
                  );
                })}
              </Box>

              {locked && q.explanation && (
                <Box
                  sx={{
                    mt: 1.25,
                    ml: { xs: 0, sm: 4.5 },
                    p: 1.25,
                    borderRadius: t.radii.sm,
                    background: t.colors.surfaceSoft,
                    borderLeft: `3px solid ${rightPick ? t.colors.known : t.colors.accent}`,
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: t.colors.textMuted, mb: 0.25 }}>
                    Explanation
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, lineHeight: 1.55, color: t.colors.text }}>
                    {q.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {done && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: t.radii.md,
            textAlign: "center",
            border: `2px solid ${correct >= Math.ceil(total * 0.8) ? t.colors.known : t.colors.accent}`,
            background: correct >= Math.ceil(total * 0.8) ? t.colors.knownSoft : t.colors.accentSoft,
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: 20, mb: 0.5 }}>
            {correct === total
              ? "Perfect run! 🏆"
              : correct >= Math.ceil(total * 0.8)
              ? "Strong finish! 🎯"
              : "Good attempt — try again."}
          </Typography>
          <Typography sx={{ color: t.colors.textMuted, fontSize: 13.5, mb: 1.5 }}>
            You got {correct} of {total} correct.
          </Typography>
          <Button
            onClick={clear}
            variant="contained"
            startIcon={<MdRefresh />}
            sx={{
              borderRadius: t.radii.md,
              fontWeight: 800,
              background: t.gradients.primary,
              boxShadow: t.shadows.primary,
            }}
          >
            Try again
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default McqQuiz;
