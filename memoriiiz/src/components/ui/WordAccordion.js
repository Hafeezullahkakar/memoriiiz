import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, IconButton, Collapse, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { MdExpandMore, MdVolumeUp, MdVolumeOff, MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../../theme/tokens";
import { parseMeaning } from "../../utils/parseMeaning";
import StatusChip from "./StatusChip";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

/**
 * Compact expandable word row for the list view of the Words page.
 * Click header → expand body with meaning, synonyms, antonyms, sentences,
 * plus speak/edit/delete/toggle-status actions.
 */
const WordAccordion = ({ word, setWords, defaultOpen = false }) => {
  const t = useTokens();
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);
  const [speaking, setSpeaking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { definition, synonyms, antonyms } = parseMeaning(word?.meaning);

  const toggleOpen = () => setOpen((v) => !v);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis not supported");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${word.word}. ${definition || word.meaning || ""}`;
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const toggleStatus = async (e) => {
    e?.stopPropagation();
    const next = word.status === "Known" ? "To Learn" : "Known";
    try {
      const res = await axios.put(`${API_BASE}/updateWord/${word._id}`, { status: next });
      if (res.data) {
        setWords?.((prev) => prev.map((w) => (w._id === word._id ? { ...w, status: next } : w)));
        toast.success(`Marked as ${next}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await axios.delete(`${API_BASE}/deleteWord/${word._id}`);
      setWords?.((prev) => prev.filter((w) => w._id !== word._id));
      toast.success("Word deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <Box
      sx={{
        borderRadius: t.radii.lg,
        border: `1px solid ${open ? t.colors.primary : t.colors.border}`,
        background: t.colors.surface,
        boxShadow: open ? t.shadows.sm : t.shadows.xs,
        transition: `all ${t.motion.base}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        onClick={toggleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          cursor: "pointer",
          userSelect: "none",
          transition: `background ${t.motion.fast}`,
          "&:hover": { background: t.colors.hover },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: t.radii.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: open ? t.colors.primarySoft : t.colors.surfaceSoft,
            color: open ? t.colors.primary : t.colors.textMuted,
            border: `1px solid ${t.colors.border}`,
            transition: `all ${t.motion.base}`,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            flexShrink: 0,
          }}
        >
          <MdExpandMore size={22} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 17 }, flex: 1, minWidth: 0 }}>
          {word.word}
        </Typography>
        <StatusChip status={word.status || "To Learn"} onClick={toggleStatus} />
      </Box>

      {/* Body */}
      <Collapse in={open} timeout={220} unmountOnExit>
        <Box sx={{ px: { xs: 1.75, sm: 2.5 }, pb: 2, borderTop: `1px solid ${t.colors.border}`, pt: 1.75 }}>
          {definition && (
            <Box sx={{ mb: 1.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: t.colors.textMuted, mb: 0.5 }}>
                Meaning
              </Typography>
              <Typography sx={{ fontSize: { xs: 14, sm: 15 }, lineHeight: 1.55, color: t.colors.text }}>
                {definition}
              </Typography>
            </Box>
          )}

          {synonyms.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: t.colors.known, mb: 0.75 }}>
                Synonyms
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {synonyms.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{
                      bgcolor: t.colors.knownSoft,
                      color: t.colors.known,
                      border: `1px solid ${t.colors.knownBorder}`,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {antonyms.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: t.colors.danger, mb: 0.75 }}>
                Antonyms
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {antonyms.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    size="small"
                    sx={{
                      bgcolor: t.colors.dangerSoft,
                      color: t.colors.danger,
                      border: `1px solid ${t.colors.danger}`,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {word.sentences?.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: t.colors.textMuted, mb: 0.5 }}>
                Examples
              </Typography>
              {word.sentences.map((s, i) => (
                <Typography
                  key={i}
                  sx={{ fontSize: { xs: 13, sm: 14 }, lineHeight: 1.55, color: t.colors.textMuted, mb: 0.5, fontStyle: "italic" }}
                >
                  <Box component="span" sx={{ color: t.colors.primary, fontWeight: 700, mr: 0.5 }}>
                    {i + 1}.
                  </Box>
                  {s}
                </Typography>
              ))}
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", mt: 1, pt: 1, borderTop: `1px dashed ${t.colors.border}` }}>
            <Tooltip title={speaking ? "Stop" : "Listen"}>
              <IconButton size="small" onClick={handleSpeak} sx={{ color: t.colors.primary }}>
                {speaking ? <MdVolumeOff /> : <MdVolumeUp />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate("/addword", { state: word._id }); }} sx={{ color: t.colors.textMuted }}>
                <MdEdit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} sx={{ color: t.colors.danger }}>
                <MdDelete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Collapse>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} PaperProps={{ sx: { borderRadius: t.radii.lg } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete "{word.word}"?</DialogTitle>
        <DialogContent>
          <DialogContentText>This can't be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 800 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WordAccordion;
