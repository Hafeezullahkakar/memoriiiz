import React, { useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
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
  useTheme,
} from "@mui/material";
import { MdAutoAwesome, MdRefresh, MdOpenInNew, MdHistory } from "react-icons/md";
import ParagraphView from "../components/paragraph/ParagraphView";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const COUNT_OPTIONS = [10, 15, 20, 30, 50, 75, 100];

const SAMPLE_HINT = "Words are pulled at random from your \"To Learn\" GRE list.";

function Practice() {
  const theme = useTheme();
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState(null); // {paragraph, words, _id, createdAt}
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-paragraph`, { count });
      setEntry(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to generate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Box textAlign="center" mb={4}>
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

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            component={RouterLink}
            to="/practice/history"
            startIcon={<MdHistory />}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            View history
          </Button>
        </Stack>

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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
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
              {SAMPLE_HINT}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : entry ? (
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
                "&:hover": { background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)" },
              }}
            >
              {loading ? "Generating..." : entry ? "Regenerate" : "Generate"}
            </Button>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {entry && <ParagraphView entry={entry} />}

        {!entry && !loading && !error && (
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
