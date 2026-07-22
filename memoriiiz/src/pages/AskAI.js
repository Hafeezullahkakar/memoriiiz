import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Stack,
  useTheme,
  Tooltip,
} from "@mui/material";
import { MdAutoAwesome, MdSend, MdRefresh, MdPerson } from "react-icons/md";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const SAMPLE_QUESTIONS = [
  "What does 'ubiquitous' mean?",
  "Difference between 'affect' and 'effect'?",
  "Synonym for 'ephemeral' with example",
  "When to use 'whom' vs 'who'?",
];

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm your English tutor. Ask me anything about grammar, vocabulary, word meanings, or usage — I'll explain clearly with examples.",
};

// Insert blank lines before list items and headings so react-markdown parses
// them correctly even when the model omits the separator.
const normalizeMarkdown = (text) =>
  (text || "")
    .replace(/([^\n])\n(\s*[*\-+]\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(\s*\d+\.\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2");

function MessageBubble({ message, isUser }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        justifyContent: isUser ? "flex-end" : "flex-start",
        px: { xs: 1, sm: 2 },
        animation: "fadeInUp 0.3s ease-out",
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          <MdAutoAwesome size={20} color="#fff" />
        </Avatar>
      )}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          maxWidth: { xs: "82%", md: "72%" },
          borderRadius: 3,
          borderTopLeftRadius: isUser ? 24 : 6,
          borderTopRightRadius: isUser ? 6 : 24,
          bgcolor: isUser
            ? "primary.main"
            : isDark
            ? "rgba(255,255,255,0.06)"
            : "#f5f7fb",
          color: isUser ? "primary.contrastText" : "text.primary",
          boxShadow: isUser
            ? "0 4px 14px rgba(99, 102, 241, 0.25)"
            : isDark
            ? "none"
            : "0 2px 8px rgba(0,0,0,0.04)",
          border: !isUser && !isDark ? "1px solid rgba(0,0,0,0.05)" : "none",
          fontSize: "0.95rem",
          lineHeight: 1.65,
          "& p": { m: 0, mb: 1.25, "&:last-child": { mb: 0 } },
          "& ul, & ol": { pl: 3, my: 1, "& li": { mb: 0.75 } },
          "& ul": { listStyleType: "disc" },
          "& code": {
            bgcolor: isUser ? "rgba(255,255,255,0.22)" : "rgba(99,102,241,0.1)",
            color: isUser ? "inherit" : "primary.main",
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.88em",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontWeight: 600,
          },
          "& pre": {
            bgcolor: isUser ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.06)",
            p: 2,
            borderRadius: 2,
            overflow: "auto",
            fontSize: "0.85em",
            "& code": { bgcolor: "transparent", p: 0, color: "inherit" },
          },
          "& strong": { fontWeight: 700 },
          "& em": { fontStyle: "italic" },
          "& blockquote": {
            borderLeft: "3px solid",
            borderColor: isUser ? "rgba(255,255,255,0.4)" : "primary.main",
            pl: 1.5,
            ml: 0,
            my: 1,
            fontStyle: "italic",
            opacity: 0.9,
          },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            fontSize: "1.05rem",
            fontWeight: 700,
            mt: 1.5,
            mb: 0.75,
            "&:first-of-type": { mt: 0 },
          },
          "& hr": {
            border: "none",
            borderTop: "1px solid",
            borderColor: isUser ? "rgba(255,255,255,0.2)" : "divider",
            my: 1.5,
          },
          "& a": {
            color: isUser ? "inherit" : "primary.main",
            textDecoration: "underline",
          },
          "& table": {
            borderCollapse: "collapse",
            my: 1,
            "& th, & td": {
              border: "1px solid",
              borderColor: "divider",
              px: 1,
              py: 0.5,
            },
            "& th": { fontWeight: 700, bgcolor: "rgba(0,0,0,0.03)" },
          },
        }}
      >
        {isUser ? (
          <Typography sx={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
            {message.content}
          </Typography>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {normalizeMarkdown(message.content)}
          </ReactMarkdown>
        )}
      </Paper>
      {isUser && (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            bgcolor: theme.palette.mode === "dark" ? "grey.700" : "grey.800",
          }}
        >
          <MdPerson size={20} />
        </Avatar>
      )}
    </Box>
  );
}

function TypingBubble() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
        }}
      >
        <MdAutoAwesome size={20} color="#fff" />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: 3,
          borderTopLeftRadius: 6,
          bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#f5f7fb",
          border: !isDark ? "1px solid rgba(0,0,0,0.05)" : "none",
          display: "flex",
          gap: 0.7,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "typing 1.4s infinite",
              animationDelay: `${i * 0.2}s`,
              "@keyframes typing": {
                "0%, 60%, 100%": { opacity: 0.3, transform: "translateY(0)" },
                "30%": { opacity: 1, transform: "translateY(-4px)" },
              },
            }}
          />
        ))}
      </Paper>
    </Box>
  );
}

function AskAI() {
  const theme = useTheme();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const historyForApi = nextMessages.filter(
        (m, i) => !(i === 0 && m === WELCOME)
      );
      const res = await axios.post(`${API_BASE}/ai/ask`, {
        messages: historyForApi,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    inputRef.current?.focus();
  };

  const showSamples = messages.length === 1;
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        backgroundImage: isDark
          ? "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.08) 0%, transparent 50%)"
          : "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)",
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          py: 2,
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, px: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              }}
            >
              <MdAutoAwesome size={22} color="#fff" />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, lineHeight: 1.2 }}
              >
                Ask AI
              </Typography>
              <Typography variant="caption" color="text.secondary">
                English tutor · Powered by Gemini
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="New conversation">
            <span>
              <IconButton
                onClick={clearChat}
                disabled={messages.length <= 1 || loading}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <MdRefresh />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            py: 2,
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "action.disabled",
              borderRadius: 4,
            },
          }}
        >
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} isUser={m.role === "user"} />
          ))}
          {loading && <TypingBubble />}

          {showSamples && (
            <Box sx={{ px: 2, mt: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1.5, display: "block", fontWeight: 600 }}
              >
                💡 Try asking:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {SAMPLE_QUESTIONS.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      py: 2.5,
                      fontWeight: 500,
                      borderColor: "divider",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            bgcolor: "background.paper",
            mb: 1,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
            },
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={6}
            placeholder="Ask about English grammar, words, meanings..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            variant="standard"
            autoFocus
            InputProps={{
              disableUnderline: true,
              sx: { px: 2, py: 1, fontSize: "0.95rem" },
            }}
          />
          <IconButton
            type="submit"
            disabled={loading || !input.trim()}
            sx={{
              background: !loading && input.trim()
                ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                : "action.disabledBackground",
              color: "#fff",
              width: 40,
              height: 40,
              transition: "transform 0.15s",
              "&:hover": {
                transform: "scale(1.05)",
                background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            <MdSend size={18} />
          </IconButton>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", pb: 1, opacity: 0.7 }}
        >
          Press Enter to send · Shift+Enter for a new line
        </Typography>
      </Container>
    </Box>
  );
}

export default AskAI;
