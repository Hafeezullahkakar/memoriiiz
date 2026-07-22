import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Checkbox,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  MdArrowBack,
  MdDownload,
  MdDelete,
  MdHistory,
  MdOpenInNew,
} from "react-icons/md";
import { generateParagraphPdf } from "../utils/generateParagraphPdf";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

function PracticeHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // "single:id" | "many" | null

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/paragraphs`);
      setItems(res.data || []);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i._id)));
  };

  const downloadPdf = (entries, filename) => {
    if (!entries.length) {
      toast.error("Nothing to download");
      return;
    }
    try {
      generateParagraphPdf(entries, filename);
    } catch (err) {
      toast.error("PDF export failed");
      console.error(err);
    }
  };

  const handleDownloadSelected = () => {
    const entries = items.filter((i) => selected.has(i._id));
    downloadPdf(entries, `gre-practice-${entries.length}-selected.pdf`);
  };

  const handleDownloadAll = () => {
    downloadPdf(items, `gre-practice-all.pdf`);
  };

  const handleDeleteConfirmed = async () => {
    try {
      if (confirmDelete === "many") {
        await axios.post(`${API_BASE}/paragraphs/delete-many`, {
          ids: Array.from(selected),
        });
        toast.success(`Deleted ${selected.size} paragraph(s)`);
        setSelected(new Set());
      } else if (confirmDelete?.startsWith("single:")) {
        const id = confirmDelete.slice(7);
        await axios.delete(`${API_BASE}/paragraphs/${id}`);
        toast.success("Deleted");
      }
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error("Delete failed");
      setConfirmDelete(null);
    }
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 5 }}>
      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate("/practice")}>
            <MdArrowBack />
          </IconButton>
          <Box sx={{ display: "inline-flex", color: "primary.main" }}>
            <MdHistory size={32} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Practice History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {items.length} saved paragraph{items.length === 1 ? "" : "s"}
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 6, borderRadius: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}
          >
            <Typography color="text.secondary" gutterBottom>
              No saved paragraphs yet.
            </Typography>
            <Button
              component={RouterLink}
              to="/practice"
              variant="contained"
              sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
            >
              Generate your first
            </Button>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                mb: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={selected.size > 0 && selected.size === items.length}
                indeterminate={selected.size > 0 && selected.size < items.length}
                onChange={toggleAll}
              />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {selected.size > 0
                  ? `${selected.size} selected`
                  : "Select paragraphs to download or delete"}
              </Typography>
              <Button
                size="small"
                startIcon={<MdDownload />}
                onClick={handleDownloadSelected}
                disabled={selected.size === 0}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Download selected
              </Button>
              <Button
                size="small"
                startIcon={<MdDownload />}
                onClick={handleDownloadAll}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Download all
              </Button>
              <Button
                size="small"
                startIcon={<MdDelete />}
                onClick={() => setConfirmDelete("many")}
                disabled={selected.size === 0}
                color="error"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Delete
              </Button>
            </Paper>

            <Stack spacing={2}>
              {items.map((item) => (
                <Paper
                  key={item._id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: selected.has(item._id) ? "primary.main" : "divider",
                    bgcolor: "background.paper",
                    transition: "all 0.15s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Checkbox
                      checked={selected.has(item._id)}
                      onChange={() => toggle(item._id)}
                      sx={{ mt: -0.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
                        <Chip
                          label={`${item.count || item.words?.length || 0} words`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)",
                            color: "primary.main",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontFamily: "'Georgia', serif",
                          lineHeight: 1.6,
                          mb: 1,
                        }}
                      >
                        {item.paragraph}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(item.words || []).slice(0, 8).map((w) => (
                          <Chip
                            key={w.word}
                            label={w.word}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: 22 }}
                          />
                        ))}
                        {item.words?.length > 8 && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, alignSelf: "center" }}>
                            +{item.words.length - 8} more
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Stack direction="column" spacing={0.5}>
                      <Tooltip title="Open">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/practice/history/${item._id}`)}
                        >
                          <MdOpenInNew size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          onClick={() => downloadPdf([item], `gre-practice-${item._id}.pdf`)}
                        >
                          <MdDownload size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setConfirmDelete(`single:${item._id}`)}
                          color="error"
                        >
                          <MdDelete size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}

        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDelete === "many"
                ? `Delete ${selected.size} selected paragraph(s)? This cannot be undone.`
                : "Delete this paragraph? This cannot be undone."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirmed} color="error" variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default PracticeHistory;
