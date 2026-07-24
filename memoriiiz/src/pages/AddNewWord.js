import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../redux/authSlice";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { MdAdd, MdDelete, MdSend, MdTranslate } from "react-icons/md";
import PageHeader from "../components/ui/PageHeader";
import { useTokens } from "../theme/tokens";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const AddNewWord = () => {
  const t = useTokens();
  const location = useLocation();
  const { state } = location;
  const token = useSelector(selectToken);
  const navigate = useNavigate();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [picture, setPicture] = useState("");
  const [video, setVideo] = useState("");
  const [sentences, setSentences] = useState([]);
  const [sentence, setSentence] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!state) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/getWordById/${state}`);
        setWord(res?.data?.word || "");
        setMeaning(res?.data?.meaning || "");
        setPicture(res?.data?.picture || "");
        setVideo(res?.data?.video || "");
        setSentences([...(res?.data?.sentences || [])]);
      } catch (e) {
        toast.error("Failed to load word");
      }
    })();
  }, [state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word || !meaning) {
      toast.error("Word and Meaning are required");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    const payload = { word, meaning, picture, video, sentences };
    try {
      const url = `${API_BASE}/${state ? `updateWord/${state}` : "addWord"}`;
      const method = state ? "put" : "post";
      await axios[method](url, payload, { headers: { "x-auth-token": token } });
      toast.success(state ? "Word updated" : "Word added");
      navigate("/words");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const addSentence = () => {
    if (sentence.trim()) {
      setSentences([...sentences, sentence.trim()]);
      setSentence("");
    }
  };
  const removeSentence = (i) => setSentences(sentences.filter((_, idx) => idx !== i));

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: t.radii.md,
      bgcolor: t.colors.bg,
      "& fieldset": { borderColor: t.colors.border },
      "&:hover fieldset": { borderColor: t.colors.borderStrong },
      "&.Mui-focused fieldset": { borderColor: t.colors.primary },
    },
  };

  return (
    <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="sm">
        <PageHeader
          title={state ? "Edit Word" : "Add a Word"}
          subtitle={state ? "Refine an entry in your vocabulary." : "Contribute a new word to your library."}
        />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: t.radii.xl,
            border: `1px solid ${t.colors.border}`,
            bgcolor: t.colors.surface,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Word"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdTranslate color={t.colors.primary} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Meaning"
                required
                multiline
                rows={3}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                helperText='Format: "Definition. Synonyms: a, b. Antonym: c."'
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Picture URL (optional)"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Video URL (optional)"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="https://youtube.com/…"
                sx={inputSx}
              />

              <Box>
                <Typography sx={{ mb: 1, fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: t.colors.textMuted }}>
                  Example Sentences
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add an example sentence…"
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSentence())}
                    sx={inputSx}
                  />
                  <Button
                    variant="contained"
                    onClick={addSentence}
                    sx={{
                      minWidth: 48,
                      px: 0,
                      borderRadius: t.radii.md,
                      background: t.gradients.primary,
                    }}
                  >
                    <MdAdd size={22} />
                  </Button>
                </Box>

                <Box sx={{ borderRadius: t.radii.md, bgcolor: t.colors.bg, border: `1px solid ${t.colors.border}`, overflow: "hidden" }}>
                  {sentences.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: "center", color: t.colors.textFaint, fontSize: 13 }}>
                      No examples yet.
                    </Typography>
                  ) : (
                    sentences.map((sent, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          px: 2,
                          py: 1.25,
                          borderTop: i > 0 ? `1px solid ${t.colors.border}` : "none",
                        }}
                      >
                        <Typography sx={{ fontStyle: "italic", fontSize: 14, flex: 1 }}>{sent}</Typography>
                        <IconButton size="small" onClick={() => removeSentence(i)} sx={{ color: t.colors.danger }}>
                          <MdDelete />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<MdSend />}
                sx={{
                  py: 1.5,
                  fontWeight: 800,
                  borderRadius: t.radii.md,
                  background: t.gradients.primary,
                  boxShadow: t.shadows.primary,
                }}
              >
                {state ? "Update Word" : "Save Word"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: t.radii.lg, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{state ? "Update this word?" : "Add this word?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {state ? `Save changes to "${word}"?` : `Add "${word}" to your vocabulary?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            sx={{ fontWeight: 800, borderRadius: t.radii.md, background: t.gradients.primary }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddNewWord;
