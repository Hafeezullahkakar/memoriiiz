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
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  useTheme,
  InputAdornment
} from "@mui/material";
import { MdAdd, MdDelete, MdSend, MdTranslate } from "react-icons/md";

const AddNewWord = () => {
  const theme = useTheme();
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

  useEffect(() => {
    if (state) {
      const fetchWords = async () => {
        try {
          const response = await axios.get(
            `https://memoriiiz.vercel.app/api/getWordById/${state}`
          );
          setWord(response?.data?.word);
          setMeaning(response?.data?.meaning);
          setPicture(response?.data?.picture);
          setVideo(response?.data?.video);
          setSentences([...response?.data?.sentences]);
        } catch (error) {
          console.error("Error fetching word:", error);
          toast.error("Failed to load word data");
        }
      };
      fetchWords();
    }
  }, [state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newWord = {
      word,
      meaning,
      picture,
      video,
      sentences,
    };

    if (!word || !meaning) {
      toast.error("Word and Meaning are required!");
      return;
    }

    try {
      const apiUrl = `https://memoriiiz.vercel.app/api/${state ? `updateWord/${state}` : 'addWord'}`;
      const method = state ? 'put' : 'post';
      
      const response = await axios[method](apiUrl, newWord, {
        headers: { "x-auth-token": token },
      });

      toast.success(state ? "Word updated successfully!" : "Word added successfully!");
      navigate("/wordslist");
    } catch (error) {
      console.error("Error submitting word:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const addSentence = () => {
    if (sentence.trim() !== "") {
      setSentences([...sentences, sentence.trim()]);
      setSentence("");
    }
  };

  const removeSentence = (index) => {
    setSentences(sentences.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
              {state ? "Enhance Your Library" : "Expand Vocabulary"}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
              {state ? "Edit Word" : "Contribute New Word"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {state ? "Refine the details of your saved word." : "Add a new word to your collection and start mastering it."}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Word"
                variant="outlined"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdTranslate color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Meaning"
                variant="outlined"
                required
                multiline
                rows={2}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
              />

              <TextField
                fullWidth
                label="Picture URL (Optional)"
                variant="outlined"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />

              <TextField
                fullWidth
                label="Video URL (Optional)"
                variant="outlined"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="https://youtube.com/..."
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}>
                  Example Sentences
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add an example sentence..."
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSentence())}
                  />
                  <Button 
                    variant="contained" 
                    onClick={addSentence}
                    sx={{ minWidth: 'unset', px: 2 }}
                  >
                    <MdAdd size={24} />
                  </Button>
                </Box>

                <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                  {sentences.map((sent, index) => (
                    <ListItem 
                      key={index}
                      divider={index !== sentences.length - 1}
                      sx={{ py: 1 }}
                    >
                      <ListItemText 
                        primary={sent} 
                        primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeSentence(index)} size="small">
                          <MdDelete color={theme.palette.error.main} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {sentences.length === 0 && (
                    <Typography variant="caption" sx={{ display: 'block', p: 2, textAlign: 'center', color: 'text.disabled' }}>
                      No sentences added yet.
                    </Typography>
                  )}
                </List>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<MdSend />}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 700, 
                  borderRadius: 2,
                  boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                }}
              >
                {state ? "Update Word" : "Save to Vocabulary"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddNewWord;
