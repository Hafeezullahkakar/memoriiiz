import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Typography,
  Box,
  Stack,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { MdArrowBack, MdDownload, MdAutoAwesome } from "react-icons/md";
import ParagraphView from "../components/paragraph/ParagraphView";
import { generateParagraphPdf } from "../utils/generateParagraphPdf";

const API_BASE =
  process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

function PracticeDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await axios.get(`${API_BASE}/paragraphs/${id}`);
        setEntry(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load paragraph");
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  const handleDownload = () => {
    if (!entry) return;
    try {
      generateParagraphPdf([entry], `gre-practice-${entry._id}.pdf`);
    } catch (err) {
      toast.error("PDF export failed");
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
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate("/practice/history")}>
            <MdArrowBack />
          </IconButton>
          <Box sx={{ display: "inline-flex", color: "primary.main" }}>
            <MdAutoAwesome size={28} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Saved Paragraph
            </Typography>
            {entry?.createdAt && (
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.createdAt).toLocaleString()}
              </Typography>
            )}
          </Box>
          {entry && (
            <Button
              startIcon={<MdDownload />}
              variant="outlined"
              onClick={handleDownload}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              PDF
            </Button>
          )}
        </Stack>

        {loading && (
          <Box textAlign="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {entry && <ParagraphView entry={entry} />}
      </Container>
    </Box>
  );
}

export default PracticeDetail;
