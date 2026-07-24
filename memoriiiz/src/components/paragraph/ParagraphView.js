import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  ClickAwayListener,
  useTheme,
} from "@mui/material";
import { MdContentCopy, MdCheckCircle, MdVolumeUp } from "react-icons/md";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { parseMeaning } from "../../utils/parseMeaning";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Speak a word out loud (single word or word + definition).
function speakWord(word, definition) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const text = definition ? `${word}. ${definition}` : word;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

// Compact tooltip body for a highlighted word in the paragraph.
function HighlightTooltip({ word, onMarkKnown, marking, isKnown }) {
  const { definition, synonyms, antonyms } = parseMeaning(word.meaning);
  return (
    <Box sx={{ maxWidth: 300 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
          {word.word}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            speakWord(word.word, definition);
          }}
          sx={{
            color: "#FCD34D",
            border: "1px solid rgba(252,211,77,0.4)",
            borderRadius: "4px",
            p: 0.5,
            "&:hover": { bgcolor: "rgba(252,211,77,0.15)" },
          }}
          aria-label="speak word"
        >
          <MdVolumeUp size={16} />
        </IconButton>
      </Box>
      {definition && (
        <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.45, mb: (synonyms.length || antonyms.length) ? 0.75 : 0, opacity: 0.95 }}>
          {definition}
        </Typography>
      )}
      {synonyms.length > 0 && (
        <Box sx={{ mb: antonyms.length ? 0.75 : 0 }}>
          <Typography sx={{ fontWeight: 700, opacity: 0.75, display: "block", fontSize: "0.65rem", letterSpacing: 1 }}>
            SYNONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mt: 0.4 }}>
            {synonyms.map((s) => (
              <Box key={s} sx={{ px: 0.6, py: 0.15, bgcolor: "rgba(34,197,94,0.22)", border: "1px solid rgba(34,197,94,0.45)", borderRadius: "3px", fontSize: "0.68rem", fontWeight: 600 }}>
                {s}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {antonyms.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 700, opacity: 0.75, display: "block", fontSize: "0.65rem", letterSpacing: 1 }}>
            ANTONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mt: 0.4 }}>
            {antonyms.map((a) => (
              <Box key={a} sx={{ px: 0.6, py: 0.15, bgcolor: "rgba(239,68,68,0.22)", border: "1px solid rgba(239,68,68,0.45)", borderRadius: "3px", fontSize: "0.68rem", fontWeight: 600 }}>
                {a}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {(word._id || word.wordId) && (
        <Box sx={{ mt: 0.75, pt: 0.75, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {isKnown ? (
            <Typography sx={{ color: "#86EFAC", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.72rem" }}>
              <MdCheckCircle size={13} /> Marked as Known
            </Typography>
          ) : (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMarkKnown();
              }}
              disabled={marking}
              startIcon={<MdCheckCircle size={13} />}
              sx={{
                py: 0.25,
                px: 1,
                fontSize: "0.68rem",
                textTransform: "none",
                color: "#86EFAC",
                borderColor: "rgba(134,239,172,0.4)",
                borderRadius: "4px",
                "&:hover": { bgcolor: "rgba(34,197,94,0.15)", borderColor: "#86EFAC" },
              }}
              variant="outlined"
            >
              {marking ? "Marking…" : "I know this word"}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

// Build the highlighted paragraph. Each highlighted <mark> is a click-controlled
// MUI Tooltip: click to open, click again or click outside to close.
function highlightParagraph({ paragraph, words, theme, openIdx, setOpenIdx, tooltipHandlers }) {
  if (!paragraph || !words?.length) return paragraph;
  const pattern = new RegExp(
    `\\b(${words.map((w) => escapeRegExp(w.word || w)).join("|")})[a-z]*\\b`,
    "gi"
  );
  const parts = [];
  let last = 0;
  let match;
  let idx = 0;
  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > last) parts.push(paragraph.slice(last, match.index));

    const baseWord = (match[1] || "").toLowerCase();
    const wordObj =
      words.find((w) => (w.word || w).toLowerCase() === baseWord) ||
      { word: match[0], meaning: "" };

    const thisIdx = idx;
    const isOpen = openIdx === thisIdx;

    parts.push(
      <Tooltip
        key={thisIdx}
        open={isOpen}
        arrow
        placement="top"
        disableHoverListener
        disableFocusListener
        disableTouchListener
        title={
          <HighlightTooltip
            word={wordObj}
            onMarkKnown={() => tooltipHandlers.onMarkKnown(wordObj)}
            marking={tooltipHandlers.markingId === (wordObj._id || wordObj.wordId)}
            isKnown={tooltipHandlers.knownIds.has(wordObj._id || wordObj.wordId)}
          />
        }
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: theme.palette.mode === "dark" ? "#0A0E13" : "#1F2937",
              color: "#fff",
              p: 1.25,
              maxWidth: 320,
              borderRadius: "6px",
              "& .MuiTooltip-arrow": {
                color: theme.palette.mode === "dark" ? "#0A0E13" : "#1F2937",
              },
            },
          },
        }}
      >
        <Box
          component="mark"
          onClick={(e) => {
            e.stopPropagation();
            setOpenIdx(isOpen ? null : thisIdx);
          }}
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(245, 158, 11, 0.18)"
                : "rgba(217, 119, 6, 0.14)",
            color: "text.primary",
            px: 0.5,
            borderRadius: "3px",
            fontWeight: 700,
            borderBottom: "2px solid",
            borderColor: "#D97706",
            cursor: "pointer",
            userSelect: "none",
            transition: "background-color 0.12s",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(245, 158, 11, 0.28)"
                  : "rgba(217, 119, 6, 0.22)",
            },
          }}
        >
          {match[0]}
        </Box>
      </Tooltip>
    );

    idx++;
    last = pattern.lastIndex;
  }
  if (last < paragraph.length) parts.push(paragraph.slice(last));
  return parts;
}

export default function ParagraphView({ entry, onWordMarkedKnown }) {
  const theme = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [knownIds, setKnownIds] = useState(new Set());
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setKnownIds(new Set());
    setOpenIdx(null);
  }, [entry?.paragraph]);

  if (!entry?.paragraph) return null;

  const paragraph = entry.paragraph;
  const words = entry.words || [];
  const wordCount = paragraph.split(/\s+/).filter(Boolean).length;
  const charCount = paragraph.length;

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis not supported in this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(paragraph);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paragraph);
      toast.success("Copied! Paste into MonkeyType custom test.");
    } catch {
      toast.error("Copy failed — select and copy manually.");
    }
  };

  const handleMarkKnown = async (word) => {
    const id = word._id || word.wordId;
    if (!id || markingId) return;
    setMarkingId(id);
    try {
      await axios.put(`${API_BASE}/updateWord/${id}`, { status: "Known" });
      setKnownIds((prev) => new Set(prev).add(id));
      toast.success(`"${word.word}" marked as Known`);
      onWordMarkedKnown?.(id);
    } catch (err) {
      toast.error("Failed to update word status");
    } finally {
      setMarkingId(null);
    }
  };

  const tooltipHandlers = { onMarkKnown: handleMarkKnown, markingId, knownIds };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Paragraph · {wordCount} words · {charCount} chars
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title={isSpeaking ? "Stop speaking" : "Read aloud"}>
              <IconButton
                onClick={handleSpeak}
                sx={{
                  border: "1px solid",
                  borderColor: isSpeaking ? "primary.main" : "divider",
                  color: isSpeaking ? "primary.main" : "inherit",
                  borderRadius: "5px",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {isSpeaking ? <HiOutlineSpeakerXMark size={18} /> : <HiOutlineSpeakerWave size={18} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy plain text">
              <IconButton
                onClick={handleCopy}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: "5px", "&:hover": { bgcolor: "action.hover" } }}
              >
                <MdContentCopy size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <ClickAwayListener onClickAway={() => setOpenIdx(null)}>
          <Typography
            component="div"
            sx={{
              fontSize: "1.1rem",
              lineHeight: 1.85,
              color: "text.primary",
              fontFamily: "'Georgia', serif",
              textAlign: "justify",
              hyphens: "auto",
              WebkitHyphens: "auto",
            }}
          >
            {highlightParagraph({ paragraph, words, theme, openIdx, setOpenIdx, tooltipHandlers })}
          </Typography>
        </ClickAwayListener>

        <Typography sx={{ mt: 2, fontSize: "0.75rem", color: "text.disabled", fontStyle: "italic" }}>
          Tip: tap a highlighted word to see its meaning.
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1, display: "block", mb: 1.5 }}>
          Words used ({words.length})
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {words.map((w) => {
            const id = w._id || w.wordId;
            const isKnown = id && knownIds.has(id);
            return (
              <Tooltip
                key={id || w.word}
                arrow
                enterTouchDelay={0}
                leaveTouchDelay={8000}
                title={
                  <HighlightTooltip
                    word={w}
                    onMarkKnown={() => handleMarkKnown(w)}
                    marking={markingId === id}
                    isKnown={isKnown}
                  />
                }
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.mode === "dark" ? "#0A0E13" : "#1F2937",
                      color: "#fff",
                      p: 1.25,
                      maxWidth: 320,
                      borderRadius: "6px",
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.mode === "dark" ? "#0A0E13" : "#1F2937",
                      },
                    },
                  },
                }}
              >
                <Chip
                  label={w.word}
                  sx={{
                    fontWeight: 600,
                    cursor: "help",
                    bgcolor: isKnown ? "rgba(15, 122, 63, 0.14)" : "rgba(217, 119, 6, 0.12)",
                    color: isKnown ? "#0F7A3F" : "#B45309",
                    border: "1px solid",
                    borderColor: isKnown ? "rgba(15,122,63,0.4)" : "rgba(217,119,6,0.35)",
                    textDecoration: isKnown ? "line-through" : "none",
                    opacity: isKnown ? 0.7 : 1,
                    transition: "all 0.15s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${isKnown ? "rgba(15,122,63,0.2)" : "rgba(217,119,6,0.22)"}`,
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>
      </Paper>
    </>
  );
}
