import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Container, Box, Skeleton, Pagination, ToggleButton, ToggleButtonGroup, Chip, Stack, Typography, TextField, InputAdornment } from "@mui/material";
import { MdViewModule, MdViewList, MdSearch, MdClose } from "react-icons/md";
import { useTokens } from "../theme/tokens";
import PageHeader from "../components/ui/PageHeader";
import WordAccordion from "../components/ui/WordAccordion";
import FlipCard from "../components/flipcard/FlipCard";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PER_PAGE_LIST = 30;
const PER_PAGE_CARDS = 20;

const Words = () => {
  const t = useTokens();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("To Learn"); // "To Learn" | "Known" | "All"
  const [view, setView] = useState(() => localStorage.getItem("words_view") || "list");
  const [letter, setLetter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/getAllWords`);
        if (alive) setWords(res?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => localStorage.setItem("words_view", view), [view]);

  // ─── counts (always from the full list) ───────────────────────────────
  const counts = useMemo(() => {
    const total = words.length;
    const known = words.filter((w) => w.status === "Known").length;
    const focus = words.filter((w) => w.status === "Focus").length;
    const toLearn = total - known - focus;
    return { total, known, focus, toLearn };
  }, [words]);

  // ─── filtered ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = words;
    if (status !== "All") {
      out = out.filter((w) => {
        if (status === "Known") return w.status === "Known";
        if (status === "Focus") return w.status === "Focus";
        return w.status === "To Learn" || !w.status; // "To Learn"
      });
    }
    if (letter !== "All") {
      out = out.filter((w) => (w.word || "").charAt(0).toUpperCase() === letter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((w) => (w.word || "").toLowerCase().includes(q) || (w.meaning || "").toLowerCase().includes(q));
    }
    return out;
  }, [words, status, letter, search]);

  const availableLetters = useMemo(() => {
    const set = new Set();
    words
      .filter((w) => {
        if (status === "All") return true;
        if (status === "Known") return w.status === "Known";
        if (status === "Focus") return w.status === "Focus";
        return w.status === "To Learn" || !w.status;
      })
      .forEach((w) => {
        const first = (w.word || "").charAt(0).toUpperCase();
        if (first) set.add(first);
      });
    return set;
  }, [words, status]);

  // Reset page when filters change
  useEffect(() => setPage(1), [status, letter, search, view]);

  const perPage = view === "list" ? PER_PAGE_LIST : PER_PAGE_CARDS;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const changePage = (_e, v) => {
    setPage(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title="Your Words"
          subtitle="Everything you're learning, in one place."
          stats={[
            { label: "Total", value: counts.total, tone: "neutral" },
            { label: "To Learn", value: counts.toLearn, tone: "toLearn" },
            { label: "Focus", value: counts.focus, tone: "primary" },
            { label: "Known", value: counts.known, tone: "known" },
            { label: "Showing", value: filtered.length, tone: "neutral" },
          ]}
        />

        {/* Controls row */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 2.5,
            p: 1.5,
            borderRadius: t.radii.lg,
            background: t.colors.surface,
            border: `1px solid ${t.colors.border}`,
          }}
        >
          {/* Status filter */}
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(_e, v) => v && setStatus(v)}
            size="small"
            sx={{
              bgcolor: t.colors.bg,
              borderRadius: t.radii.md,
              p: 0.5,
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.75,
                fontWeight: 700,
                fontSize: 13,
                border: "none !important",
                borderRadius: `${t.radii.sm}px !important`,
                textTransform: "none",
                color: t.colors.textMuted,
                "&.Mui-selected": {
                  bgcolor: t.colors.surface,
                  color: t.colors.text,
                  boxShadow: t.shadows.xs,
                  "&:hover": { bgcolor: t.colors.surface },
                },
              },
            }}
          >
            <ToggleButton value="To Learn">To Learn</ToggleButton>
            <ToggleButton value="Focus">Focus</ToggleButton>
            <ToggleButton value="Known">Known</ToggleButton>
            <ToggleButton value="All">All</ToggleButton>
          </ToggleButtonGroup>

          {/* Search */}
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search word or meaning"
            size="small"
            sx={{
              flex: 1,
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: t.radii.md,
                bgcolor: t.colors.bg,
                fontSize: 14,
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: t.colors.borderStrong },
                "&.Mui-focused fieldset": { borderColor: t.colors.primary },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch color={t.colors.textMuted} size={18} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <MdClose style={{ cursor: "pointer" }} onClick={() => setSearch("")} color={t.colors.textMuted} size={18} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* View toggle */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_e, v) => v && setView(v)}
            size="small"
            sx={{
              bgcolor: t.colors.bg,
              borderRadius: t.radii.md,
              p: 0.5,
              "& .MuiToggleButton-root": {
                px: 1.25,
                py: 0.75,
                border: "none !important",
                borderRadius: `${t.radii.sm}px !important`,
                color: t.colors.textMuted,
                "&.Mui-selected": {
                  bgcolor: t.colors.surface,
                  color: t.colors.primary,
                  boxShadow: t.shadows.xs,
                  "&:hover": { bgcolor: t.colors.surface },
                },
              },
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <MdViewList size={18} />
            </ToggleButton>
            <ToggleButton value="cards" aria-label="card view">
              <MdViewModule size={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* A–Z chips */}
        <Box sx={{ mb: 3, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Stack direction="row" spacing={0.5} sx={{ pb: 1, minWidth: "min-content" }}>
            {["All", ...LETTERS].map((L) => {
              const enabled = L === "All" || availableLetters.has(L);
              const selected = letter === L;
              return (
                <Chip
                  key={L}
                  label={L}
                  onClick={() => enabled && setLetter(L)}
                  disabled={!enabled}
                  sx={{
                    fontWeight: 800,
                    minWidth: 36,
                    height: 32,
                    borderRadius: t.radii.md,
                    bgcolor: selected ? t.colors.primary : "transparent",
                    color: selected ? "#fff" : (enabled ? t.colors.text : t.colors.textFaint),
                    border: `1px solid ${selected ? t.colors.primary : t.colors.border}`,
                    opacity: enabled ? 1 : 0.4,
                    cursor: enabled ? "pointer" : "not-allowed",
                    "&:hover": enabled && !selected ? { bgcolor: t.colors.hover } : {},
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: t.radii.lg }} />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 6, sm: 10 },
              px: 3,
              borderRadius: t.radii.xl,
              border: `2px dashed ${t.colors.border}`,
              bgcolor: t.colors.surface,
            }}
          >
            <Box sx={{ fontSize: 56, mb: 1 }}>📭</Box>
            <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 0.5 }}>No words match your filters</Typography>
            <Typography color="text.secondary">Try switching filters or clearing your search.</Typography>
          </Box>
        ) : view === "list" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {pageItems.map((w) => (
              <WordAccordion key={w._id} word={w} setWords={setWords} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              "& > *": { minWidth: 0 },
            }}
          >
            {pageItems.map((w) => (
              <div key={w._id} className="cardWrapper">
                <FlipCard singleWord={w} setWords={setWords} />
              </div>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={changePage}
              color="primary"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 700,
                  borderRadius: `${t.radii.sm}px`,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Words;
