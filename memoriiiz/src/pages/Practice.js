import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  MdAutoAwesome,
  MdContentCopy,
  MdRefresh,
  MdOpenInNew,
} from "react-icons/md";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { parseMeaning } from "../utils/parseMeaning";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const COUNT_OPTIONS = [10, 15, 20, 30, 50, 75, 100];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Renders the paragraph as an array of React nodes, wrapping each target word
// (and its inflections) in a highlighted <mark>-style span. Case-insensitive,
// allows suffixes like -ed / -ing / -s.
function highlightParagraph(paragraph, words, theme) {
  if (!paragraph || !words?.length) return paragraph;
  const pattern = new RegExp(
    `\\b(${words.map((w) => escapeRegExp(w)).join("|")})[a-z]*\\b`,
    "gi"
  );
  const parts = [];
  let last = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > last) {
      parts.push(paragraph.slice(last, match.index));
    }
    parts.push(
      <Box
        component="mark"
        key={key++}
        sx={{
          bgcolor: theme.palette.mode === "dark"
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

function WordTooltipContent({ meaning }) {
  const { definition, synonyms, antonyms } = parseMeaning(meaning);
  if (!definition && !synonyms.length && !antonyms.length) {
    return <Typography variant="body2">No details available</Typography>;
  }
  return (
    <Box sx={{ maxWidth: 300 }}>
      {definition && (
        <Typography variant="body2" sx={{ mb: synonyms.length || antonyms.length ? 1 : 0 }}>
          {definition}
        </Typography>
      )}
      {synonyms.length > 0 && (
        <Box sx={{ mb: antonyms.length ? 1 : 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, opacity: 0.8, display: "block", mb: 0.5 }}
          >
            SYNONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {synonyms.map((s) => (
              <Box
                key={s}
                sx={{
                  px: 0.75,
                  py: 0.25,
                  bgcolor: "rgba(76,175,80,0.25)",
                  border: "1px solid rgba(76,175,80,0.5)",
                  borderRadius: 1,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {antonyms.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, opacity: 0.8, display: "block", mb: 0.5 }}
          >
            ANTONYMS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {antonyms.map((a) => (
              <Box
                key={a}
                sx={{
                  px: 0.75,
                  py: 0.25,
                  bgcolor: "rgba(211,47,47,0.25)",
                  border: "1px solid rgba(211,47,47,0.5)",
                  borderRadius: 1,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {a}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function Practice() {
  const theme = useTheme();
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [paragraph, setParagraph] = useState("");
  const [words, setWords] = useState([]);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancel any in-flight speech when the paragraph changes or the page unmounts.
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
  }, [paragraph]);

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

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-paragraph`, {
        count,
      });
      setParagraph(res.data.paragraph);
      setWords(res.data.words || []);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to generate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paragraph);
      toast.success("Copied! Paste into MonkeyType custom test.");
    } catch {
      toast.error("Copy failed — select and copy manually.");
    }
  };

  const wordCount = paragraph.split(/\s+/).filter(Boolean).length;
  const charCount = paragraph.length;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        py: 5,
        backgroundImage:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.08) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)",
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center" mb={5}>
          <Box sx={{ display: "inline-flex", color: "primary.main", mb: 2 }}>
            <MdAutoAwesome size={48} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Typing Practice
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Generate a GRE-style paragraph packed with words you're learning.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Copy it into{" "}
            <Box
              component="a"
              href="https://monkeytype.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              MonkeyType <MdOpenInNew size={12} />
            </Box>{" "}
            (Custom test → paste) to practice.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Number of words</InputLabel>
              <Select
                value={count}
                label="Number of words"
                onChange={(e) => setCount(e.target.value)}
                disabled={loading}
              >
                {COUNT_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} words
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Words are pulled at random from your "To Learn" GRE list.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : paragraph ? (
                  <MdRefresh />
                ) : (
                  <MdAutoAwesome />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
                },
              }}
            >
              {loading
                ? "Generating..."
                : paragraph
                ? "Regenerate"
                : "Generate"}
            </Button>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {paragraph && (
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
                position: "relative",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="overline"
                  color="primary.main"
                  sx={{ fontWeight: 700, letterSpacing: 1 }}
                >
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
                      {isSpeaking ? (
                        <HiOutlineSpeakerXMark size={18} />
                      ) : (
                        <HiOutlineSpeakerWave size={18} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy plain text">
                    <IconButton
                      onClick={handleCopy}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
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
                {highlightParagraph(
                  paragraph,
                  words.map((w) => w.word),
                  theme
                )}
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
              <Typography
                variant="overline"
                color="primary.main"
                sx={{ fontWeight: 700, letterSpacing: 1, display: "block", mb: 1.5 }}
              >
                Words used ({words.length})
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {words.map((w) => (
                  <Tooltip
                    key={w.word}
                    arrow
                    enterTouchDelay={0}
                    leaveTouchDelay={5000}
                    title={<WordTooltipContent meaning={w.meaning} />}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "grey.900"
                              : "grey.800",
                          color: "#fff",
                          p: 1.5,
                          maxWidth: 340,
                          "& .MuiTooltip-arrow": {
                            color:
                              theme.palette.mode === "dark"
                                ? "grey.900"
                                : "grey.800",
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
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(168, 85, 247, 0.15)"
                            : "rgba(168, 85, 247, 0.1)",
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: "primary.main",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(168, 85, 247, 0.25)",
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                💡 Tip: Highlighted spans in the paragraph mark where each target
                word appears (including inflections like -ed / -ing / -s).
              </Typography>
            </Paper>
          </>
        )}

        {!paragraph && !loading && !error && (
          <Box textAlign="center" mt={6}>
            <Typography color="text.secondary">
              Pick a word count and hit Generate to create a practice paragraph.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Practice;
