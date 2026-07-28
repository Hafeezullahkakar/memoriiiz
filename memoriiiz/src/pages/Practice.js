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
  Stack,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import { MdAutoAwesome, MdRefresh, MdOpenInNew, MdHistory } from "react-icons/md";
import ParagraphView from "../components/paragraph/ParagraphView";
import PageHeader from "../components/ui/PageHeader";
import { useTokens } from "../theme/tokens";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";
const COUNT_OPTIONS = [10, 15, 20, 30, 50, 75, 100];

function Practice() {
  const t = useTokens();
  const [count, setCount] = useState(20);
  const [status, setStatus] = useState("To Learn"); // "To Learn" | "Focus" | "Known"
  const [withMcqs, setWithMcqs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-paragraph`, {
        count,
        status,
        withMcqs,
      });
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
        bgcolor: t.colors.bg,
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        backgroundImage:
          t.mode === "dark"
            ? "radial-gradient(circle at 20% 0%, rgba(129,140,248,0.08) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 0%, rgba(79,70,229,0.05) 0%, transparent 50%)",
      }}
    >
      <Container maxWidth="md">
        <PageHeader
          title="AI Practice"
          subtitle={
            <>
              Generate a paragraph packed with words you're learning. Paste it into{" "}
              <Box
                component="a"
                href="https://monkeytype.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: t.colors.primary, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.25 }}
              >
                MonkeyType <MdOpenInNew size={12} />
              </Box>{" "}
              to type.
            </>
          }
          right={
            <Button
              component={RouterLink}
              to="/practice/history"
              startIcon={<MdHistory />}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: t.radii.md,
                fontWeight: 700,
                borderColor: t.colors.border,
                color: t.colors.text,
                "&:hover": { borderColor: t.colors.primary, bgcolor: t.colors.primarySoft },
              }}
            >
              History
            </Button>
          }
        />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: t.radii.lg,
            border: `1px solid ${t.colors.border}`,
            bgcolor: t.colors.surface,
            mb: 3,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Word count</InputLabel>
              <Select
                value={count}
                label="Word count"
                onChange={(e) => setCount(e.target.value)}
                disabled={loading}
                sx={{ borderRadius: t.radii.md, "& fieldset": { borderColor: t.colors.border } }}
              >
                {COUNT_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} words
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Pool</InputLabel>
              <Select
                value={status}
                label="Pool"
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                sx={{ borderRadius: t.radii.md, "& fieldset": { borderColor: t.colors.border } }}
              >
                <MenuItem value="To Learn">To Learn</MenuItem>
                <MenuItem value="Focus">Focus</MenuItem>
                <MenuItem value="Known">Known</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ flex: 1, fontSize: 13.5, color: t.colors.textMuted }}>
              Pulled at random from your <b>{status}</b> list.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : entry ? <MdRefresh /> : <MdAutoAwesome />}
              sx={{
                fontWeight: 800,
                px: 3.5,
                py: 1.25,
                borderRadius: t.radii.md,
                background: t.gradients.primary,
                boxShadow: t.shadows.primary,
              }}
            >
              {loading ? "Generating…" : entry ? "Regenerate" : "Generate"}
            </Button>
          </Stack>

          <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${t.colors.border}`, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Also generate 8–10 GRE-style multiple-choice questions based on this paragraph. Takes a few extra seconds." arrow>
              <FormControlLabel
                control={
                  <Switch
                    checked={withMcqs}
                    onChange={(e) => setWithMcqs(e.target.checked)}
                    disabled={loading}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: t.colors.primary },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: t.colors.primary,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    GRE Style Para
                    <Typography component="span" sx={{ color: t.colors.textMuted, fontWeight: 500, fontSize: 12.5, ml: 0.75 }}>
                      · adds 8–10 MCQs
                    </Typography>
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Tooltip>
          </Box>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: t.radii.md,
              bgcolor: t.colors.dangerSoft,
              color: t.colors.danger,
              border: `1px solid ${t.colors.danger}`,
            }}
          >
            {error}
          </Alert>
        )}

        {entry && <ParagraphView entry={entry} />}

        {!entry && !loading && !error && (
          <Box
            sx={{
              mt: 2,
              p: { xs: 4, sm: 6 },
              textAlign: "center",
              borderRadius: t.radii.xl,
              border: `2px dashed ${t.colors.border}`,
              bgcolor: t.colors.surface,
            }}
          >
            <Box sx={{ fontSize: 48, mb: 1 }}>✨</Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Ready when you are</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
              Pick a word count and hit <b>Generate</b> to create a practice paragraph.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Practice;
