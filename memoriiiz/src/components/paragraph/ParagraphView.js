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
  useTheme,
} from "@mui/material";
import { MdContentCopy, MdCheckCircle } from "react-icons/md";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { parseMeaning } from "../../utils/parseMeaning";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlightParagraph(paragraph, words, theme) {
  if (!paragraph || !words?.length) return paragraph;
  const pattern = new RegExp(
    `\\b(${words.map((w) => escapeRegExp(w.word || w)).join("|")})[a-z]*\\b`,
    "gi"
  );
  const parts = [];
  let last = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > last) parts.push(paragraph.slice(last, match.index));
    parts.push(
      <Box
        component="mark"
        key={key++}
        sx={{
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(168, 85, 247, 0.25)"
              : "rgba(168, 85, 247, 0.18)",
          color: "text.primary",
          px: 0.5,
          borderRadius: 0.75,
          fontWeight: 600,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        {match[0]}
      </Box>
    );
    last = pattern.lastIndex;
  }
  if (last < paragraph.length) parts.push(paragraph.slice(last));
  return parts;
}

function WordTooltipContent({ word, onMarkKnown, marking, isKnown }) {
  const { definition, synonyms, antonyms } = parseMeaning(word.meaning);
  return (
    <Box sx={{ maxWidth: 320 }}>
      {definition && (
        <Typography variant="body2" sx={{ mb: (synonyms.length || antonyms.length) ? 1 : 0 }}>
          {definition}
        </Typography>
      )}
      {synonyms.length > 0 && (
        <Box sx={{ mb: antonyms.length ? 1 : 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8, display: "block", mb: 0.5 }}>
            SYNONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {synonyms.map((s) => (
              <Box key={s} sx={{ px: 0.75, py: 0.25, bgcolor: "rgba(76,175,80,0.25)", border: "1px solid rgba(76,175,80,0.5)", borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}>
                {s}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {antonyms.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8, display: "block", mb: 0.5 }}>
            ANTONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {antonyms.map((a) => (
              <Box key={a} sx={{ px: 0.75, py: 0.25, bgcolor: "rgba(211,47,47,0.25)", border: "1px solid rgba(211,47,47,0.5)", borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}>
                {a}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {(word._id || word.wordId) && (
        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {isKnown ? (
            <Typography variant="caption" sx={{ color: "#a5d6a7", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
              <MdCheckCircle size={14} /> Marked as Known
            </Typography>
          ) : (
            <Button
              size="small"
              onClick={onMarkKnown}
              disabled={marking}
              startIcon={<MdCheckCircle size={14} />}
              sx={{
                py: 0.25,
                px: 1,
                fontSize: "0.72rem",
                textTransform: "none",
                color: "#a5d6a7",
                borderColor: "rgba(165,214,167,0.5)",
                "&:hover": { bgcolor: "rgba(76,175,80,0.15)", borderColor: "#a5d6a7" },
              }}
              variant="outlined"
            >
              {marking ? "Marking..." : "I know this word"}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function ParagraphView({ entry, onWordMarkedKnown }) {
  const theme = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [knownIds, setKnownIds] = useState(new Set());

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

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
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
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {isSpeaking ? <HiOutlineSpeakerXMark size={18} /> : <HiOutlineSpeakerWave size={18} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy plain text">
              <IconButton
                onClick={handleCopy}
                sx={{ border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}
              >
                <MdContentCopy size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.85,
            color: "text.primary",
            fontFamily: "'Georgia', serif",
          }}
        >
          {highlightParagraph(paragraph, words, theme)}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
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
                  <WordTooltipContent
                    word={w}
                    onMarkKnown={() => handleMarkKnown(w)}
                    marking={markingId === id}
                    isKnown={isKnown}
                  />
                }
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.800",
                      color: "#fff",
                      p: 1.5,
                      maxWidth: 360,
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.mode === "dark" ? "grey.900" : "grey.800",
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
                    bgcolor: isKnown
                      ? "rgba(76, 175, 80, 0.15)"
                      : theme.palette.mode === "dark"
                      ? "rgba(168, 85, 247, 0.15)"
                      : "rgba(168, 85, 247, 0.1)",
                    color: isKnown ? "success.main" : "primary.main",
                    border: "1px solid",
                    borderColor: isKnown ? "success.main" : "primary.main",
                    textDecoration: isKnown ? "line-through" : "none",
                    opacity: isKnown ? 0.7 : 1,
                    transition: "all 0.15s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${
                        isKnown ? "rgba(76,175,80,0.25)" : "rgba(168, 85, 247, 0.25)"
                      }`,
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
