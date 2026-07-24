import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
  Chip,
  Pagination,
  Tooltip,
} from "@mui/material";
import {
  MdSearch,
  MdClose,
  MdBookmark,
  MdBookmarkBorder,
  MdOpenInNew,
  MdRefresh,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdForum,
} from "react-icons/md";
import PageHeader from "../components/ui/PageHeader";
import { useTokens } from "../theme/tokens";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";
const PER_PAGE = 20;

// Deterministic color per source for badge chips.
const SOURCE_COLORS = [
  "#7C3AED", "#F43F5E", "#0EA5E9", "#10B981",
  "#F59E0B", "#EC4899", "#6366F1", "#14B8A6",
  "#EF4444", "#8B5CF6",
];
const sourceColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SOURCE_COLORS[h % SOURCE_COLORS.length];
};

const relTime = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const Reads = () => {
  const t = useTokens();
  const [tab, setTab] = useState("all"); // "all" | "bookmarks" | "read"
  const [source, setSource] = useState("");
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, bookmarked: 0, unread: 0 });

  // Debounce search input.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/articles/stats`);
      setStats(res.data);
    } catch {}
  }, []);

  const fetchSources = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/articles/sources`);
      setSources(res.data || []);
    } catch {}
  }, []);

  const params = useMemo(() => {
    const p = { limit: PER_PAGE, offset: (page - 1) * PER_PAGE };
    if (source) p.source = source;
    if (tab === "bookmarks") p.bookmarked = "true";
    if (tab === "read") { p.bookmarked = "true"; p.status = "read"; }
    if (tab === "bookmarks") p.status = "unread";
    if (debouncedSearch) p.q = debouncedSearch;
    return p;
  }, [page, source, tab, debouncedSearch]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/articles`, { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      if (res.data.refreshing) setRefreshing(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStats();
    fetchSources();
  }, [fetchStats, fetchSources]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Reset page when filters change.
  useEffect(() => setPage(1), [tab, source, debouncedSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.post(`${API_BASE}/articles/refresh`);
      toast.success(`+${res.data.added} new · ${res.data.updated} updated`);
      await Promise.all([fetchArticles(), fetchStats(), fetchSources()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleBookmark = async (article) => {
    const wasBookmarked = !!article.bookmark;
    try {
      if (wasBookmarked) {
        await axios.delete(`${API_BASE}/bookmarks/${article._id}`);
        setItems((prev) => prev.map((a) => (a._id === article._id ? { ...a, bookmark: null } : a)));
      } else {
        const res = await axios.post(`${API_BASE}/bookmarks`, { articleId: article._id });
        setItems((prev) => prev.map((a) => (a._id === article._id ? { ...a, bookmark: res.data } : a)));
      }
      fetchStats();
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const toggleReadStatus = async (article) => {
    if (!article.bookmark) return;
    const nextStatus = article.bookmark.status === "read" ? "unread" : "read";
    try {
      const res = await axios.patch(`${API_BASE}/bookmarks/${article._id}`, { status: nextStatus });
      setItems((prev) => prev.map((a) => (a._id === article._id ? { ...a, bookmark: res.data } : a)));
      fetchStats();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <PageHeader
          title="Reads"
          subtitle="Curated tech articles from your favourite sources — bookmark to save for later."
          stats={[
            { label: "Total", value: stats.total, tone: "neutral" },
            { label: "Bookmarked", value: stats.bookmarked, tone: "primary" },
            { label: "Unread", value: stats.unread, tone: "toLearn" },
          ]}
          right={
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={<MdRefresh style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />}
              size="small"
              sx={{
                borderRadius: t.radii.md,
                fontWeight: 700,
                bgcolor: t.colors.surface,
                border: `1px solid ${t.colors.border}`,
                color: t.colors.text,
                "&:hover": { bgcolor: t.colors.primarySoft, borderColor: t.colors.primary },
              }}
            >
              Refresh
            </Button>
          }
        />

        {/* Controls */}
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            flexWrap: "wrap",
            alignItems: "center",
            p: 1.25,
            mb: 2.5,
            borderRadius: t.radii.md,
            border: `1px solid ${t.colors.border}`,
            bgcolor: t.colors.surface,
          }}
        >
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_e, v) => v && setTab(v)}
            size="small"
            sx={{
              bgcolor: t.colors.bg,
              borderRadius: t.radii.md,
              p: 0.5,
              "& .MuiToggleButton-root": {
                px: 1.75,
                py: 0.5,
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
                },
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="bookmarks">Bookmarks</ToggleButton>
            <ToggleButton value="read">Read</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={source}
              displayEmpty
              onChange={(e) => setSource(e.target.value)}
              sx={{
                borderRadius: t.radii.md,
                bgcolor: t.colors.bg,
                fontSize: 13.5,
                fontWeight: 600,
                "& fieldset": { borderColor: "transparent" },
              }}
            >
              <MenuItem value="">All sources</MenuItem>
              {sources.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles + excerpts"
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
        </Box>

        {/* Article list */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: t.radii.md }} />
            ))}
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 6, sm: 10 },
              px: 3,
              borderRadius: t.radii.md,
              border: `2px dashed ${t.colors.border}`,
              bgcolor: t.colors.surface,
            }}
          >
            <Box sx={{ fontSize: 48, mb: 1 }}>📭</Box>
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5 }}>
              {tab === "bookmarks" ? "No unread bookmarks" : tab === "read" ? "Nothing read yet" : "No articles yet"}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
              {tab === "all"
                ? "Hit Refresh to fetch the latest from your feeds."
                : "Bookmark an article to see it here."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {items.map((a) => (
              <ArticleRow
                key={a._id}
                article={a}
                onToggleBookmark={() => toggleBookmark(a)}
                onToggleRead={() => toggleReadStatus(a)}
              />
            ))}
          </Box>
        )}

        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_e, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              color="primary"
              shape="rounded"
              sx={{ "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: `${t.radii.sm}px` } }}
            />
          </Box>
        )}
      </Container>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </Box>
  );
};

const ArticleRow = ({ article, onToggleBookmark, onToggleRead }) => {
  const t = useTokens();
  const badge = sourceColor(article.source);
  const isBookmarked = !!article.bookmark;
  const isRead = article.bookmark?.status === "read";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        p: { xs: 1.5, sm: 2 },
        borderRadius: t.radii.md,
        border: `1px solid ${t.colors.border}`,
        bgcolor: t.colors.surface,
        transition: `all ${t.motion.fast}`,
        opacity: isRead ? 0.7 : 1,
        "&:hover": {
          borderColor: t.colors.primary,
          transform: "translateY(-1px)",
          boxShadow: t.shadows.sm,
        },
      }}
    >
      {/* Source stripe */}
      <Box sx={{ width: 3, borderRadius: t.radii.sm, background: badge, flexShrink: 0 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Meta row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, flexWrap: "wrap" }}>
          <Chip
            label={article.source}
            size="small"
            sx={{
              bgcolor: `${badge}15`,
              color: badge,
              border: `1px solid ${badge}40`,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
              borderRadius: `${t.radii.sm}px`,
            }}
          />
          <Typography sx={{ fontSize: 12, color: t.colors.textMuted, fontWeight: 600 }}>
            {relTime(article.publishedAt)}
          </Typography>
          {article.author && (
            <Typography sx={{ fontSize: 12, color: t.colors.textFaint }}>
              · {article.author}
            </Typography>
          )}
          {article.commentsUrl && (
            <Box
              component="a"
              href={article.commentsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                ml: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: t.colors.textMuted,
                textDecoration: "none",
                "&:hover": { color: t.colors.primary },
              }}
            >
              <MdForum size={14} /> discussion
            </Box>
          )}
        </Box>

        {/* Title */}
        <Box
          component="a"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "block",
            fontWeight: 800,
            fontSize: { xs: 15.5, sm: 16.5 },
            lineHeight: 1.35,
            color: t.colors.text,
            textDecoration: isRead ? "line-through" : "none",
            mb: 0.5,
            transition: `color ${t.motion.fast}`,
            "&:hover": { color: t.colors.primary },
          }}
        >
          {article.title}
          <MdOpenInNew size={13} style={{ marginLeft: 6, opacity: 0.5, verticalAlign: "middle" }} />
        </Box>

        {/* Excerpt */}
        {article.excerpt && (
          <Typography
            sx={{
              fontSize: 13.5,
              color: t.colors.textMuted,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
            }}
          >
            {article.excerpt}
          </Typography>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark for later"}>
            <IconButton
              size="small"
              onClick={onToggleBookmark}
              sx={{
                color: isBookmarked ? t.colors.primary : t.colors.textFaint,
                borderRadius: t.radii.sm,
                "&:hover": { bgcolor: t.colors.primarySoft, color: t.colors.primary },
              }}
            >
              {isBookmarked ? <MdBookmark size={20} /> : <MdBookmarkBorder size={20} />}
            </IconButton>
          </Tooltip>
          {isBookmarked && (
            <Tooltip title={isRead ? "Mark as unread" : "Mark as read"}>
              <IconButton
                size="small"
                onClick={onToggleRead}
                sx={{
                  color: isRead ? t.colors.known : t.colors.textFaint,
                  borderRadius: t.radii.sm,
                  "&:hover": { bgcolor: t.colors.knownSoft, color: t.colors.known },
                }}
              >
                {isRead ? <MdCheckCircle size={20} /> : <MdRadioButtonUnchecked size={20} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Reads;
