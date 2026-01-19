import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Skeleton,
  useTheme,
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { MdPsychology, MdRefresh, MdCheckCircle, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";

const GREPlay = () => {
  const theme = useTheme();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongMatches, setWrongMatches] = useState({});
  const [score, setScore] = useState(0);
  const [quizType, setQuizType] = useState("To Learn");

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URI || 'https://memoriiiz.vercel.app/api'}/getWordsByType/GRE`
      );
      setWords(response?.data || []);
      const filtered = (response?.data || []).filter(w => 
        quizType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("Error loading words");
      setLoading(false);
    }
  };

  const generateQuiz = (availableWords) => {
    const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    const quizWords = [...selected].sort(() => 0.5 - Math.random());
    const quizMeanings = [...selected].sort(() => 0.5 - Math.random());

    setCurrentQuiz({
      words: quizWords,
      meanings: quizMeanings
    });
    setMatches({});
    setWrongMatches({});
    setSelectedWord(null);
    setSelectedMeaning(null);
    setScore(0);
  };

  const handleQuizTypeChange = (event, newType) => {
    if (newType !== null && newType !== quizType) {
      setQuizType(newType);
      const filtered = words.filter(w => 
        newType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
      } else {
        setCurrentQuiz(null);
      }
    }
  };

  const handleWordSelect = (word) => {
    if (matches[word._id]) return;
    setSelectedWord(word);
    if (selectedMeaning) {
      checkMatch(word, selectedMeaning);
    }
  };

  const handleMeaningSelect = (meaning) => {
    // meaning is the word object but we display the meaning
    if (Object.values(matches).some(m => m._id === meaning._id)) return;
    setSelectedMeaning(meaning);
    if (selectedWord) {
      checkMatch(selectedWord, meaning);
    }
  };

  const checkMatch = (word, meaning) => {
    if (word._id === meaning._id) {
      setMatches(prev => ({ ...prev, [word._id]: meaning }));
      setScore(prev => prev + 1);
      toast.success("Correct!");
    } else {
      setWrongMatches({ [word._id]: true, [meaning._id]: true });
      setTimeout(() => setWrongMatches({}), 1000);
      toast.error("Try again!");
    }
    setSelectedWord(null);
    setSelectedMeaning(null);
  };

  const handleReset = () => {
    const filtered = words.filter(w => 
      quizType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
    );
    if (filtered.length >= 5) {
      generateQuiz(filtered);
    } else {
      fetchWords();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={6}>
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} sx={{ mb: 2 }} />)}
          </Grid>
          <Grid item xs={6}>
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} sx={{ mb: 2 }} />)}
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!currentQuiz && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <MdPsychology size={80} color={theme.palette.divider} />
        <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
          Not enough words
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
          You need at least 5 words marked as '{quizType}' to start the quiz.
        </Typography>
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={quizType}
            exclusive
            onChange={handleQuizTypeChange}
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="To Learn">Practice "To Learn"</ToggleButton>
            <ToggleButton value="Known">Practice "Known"</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button variant="contained" href="/gre" size="large">
          Go to GRE Prep
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
            Challenge your memory
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 2, color: 'text.primary' }}>
            GRE Play: Matching Quiz
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Match the GRE words with their correct meanings.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <ToggleButtonGroup
              value={quizType}
              exclusive
              onChange={handleQuizTypeChange}
              size="small"
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiToggleButton-root': {
                  px: 3,
                  fontWeight: 600,
                  '&.Mui-selected': {
                    bgcolor: quizType === 'Known' ? 'success.main' : 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: quizType === 'Known' ? 'success.dark' : 'primary.dark',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="To Learn">To Learn</ToggleButton>
              <ToggleButton value="Known">Known</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, alignItems: 'center' }}>
              <Chip 
                label={`Score: ${score}/5`} 
                color="primary" 
                variant="outlined" 
                sx={{ fontWeight: 700, px: 2, py: 2.5, fontSize: '1rem' }} 
              />
              <Button 
                startIcon={<MdRefresh />} 
                variant="contained" 
                onClick={handleReset}
                sx={{ borderRadius: 2 }}
              >
                New Quiz
              </Button>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Words Column */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
              Words
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentQuiz?.words.map((w) => (
                <Card 
                  key={w._id}
                  onClick={() => handleWordSelect(w)}
                  sx={{ 
                    cursor: matches[w._id] ? 'default' : 'pointer',
                    bgcolor: matches[w._id] ? 'success.light' : (selectedWord?._id === w._id ? 'primary.light' : 'background.paper'),
                    color: (matches[w._id] || selectedWord?._id === w._id) ? 'white' : 'text.primary',
                    border: '2px solid',
                    borderColor: wrongMatches[w._id] ? 'error.main' : (matches[w._id] ? 'success.main' : (selectedWord?._id === w._id ? 'primary.main' : 'divider')),
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: matches[w._id] ? 'none' : 'translateX(5px)',
                      borderColor: matches[w._id] ? 'success.main' : 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ py: '16px !important', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{w.word}</Typography>
                    {matches[w._id] && <MdCheckCircle size={20} />}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Connection Visual (Hidden on mobile) */}
          <Grid item md={2} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '2px', height: '100%', bgcolor: 'divider' }} />
          </Grid>

          {/* Meanings Column */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
              Meanings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentQuiz?.meanings.map((m) => {
                const isMatched = Object.values(matches).some(match => match._id === m._id);
                return (
                  <Card 
                    key={m._id}
                    onClick={() => handleMeaningSelect(m)}
                    sx={{ 
                      cursor: isMatched ? 'default' : 'pointer',
                      bgcolor: isMatched ? 'success.light' : (selectedMeaning?._id === m._id ? 'primary.light' : 'background.paper'),
                      color: (isMatched || selectedMeaning?._id === m._id) ? 'white' : 'text.primary',
                      border: '2px solid',
                      borderColor: (wrongMatches[m._id] && selectedMeaning?._id === m._id) ? 'error.main' : (isMatched ? 'success.main' : (selectedMeaning?._id === m._id ? 'primary.main' : 'divider')),
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: isMatched ? 'none' : 'translateX(-5px)',
                        borderColor: isMatched ? 'success.main' : 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ py: '16px !important', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{m.meaning}</Typography>
                      {isMatched && <MdCheckCircle size={20} />}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {score === 5 && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'success.lighter', border: '2px dashed', borderColor: 'success.main' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 800, mb: 2 }}>
                Great job! 🎉
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                You have correctly matched all the words. Keep it up to master your GRE vocabulary.
              </Typography>
              <Button size="large" variant="contained" color="success" onClick={handleReset}>
                Play Again
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GREPlay;
