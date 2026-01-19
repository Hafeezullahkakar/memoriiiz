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
import confetti from 'canvas-confetti';

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

  useEffect(() => {
    if (score === 5) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [score]);

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
    
    // Play subtle click sound or just highlight
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
      
      // Celebration animation
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: [theme.palette.success.main, theme.palette.primary.main, '#FFD700']
      });

    } else {
      setWrongMatches({ [word._id]: true, [meaning._id]: true });
      setTimeout(() => setWrongMatches({}), 600);
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
        <Paper elevation={0} sx={{ p: 6, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
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
              sx={{ 
                bgcolor: 'background.default',
                borderRadius: '12px',
                p: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  border: 'none !important',
                  borderRadius: '10px !important',
                  mx: 0.5,
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
              <ToggleButton value="To Learn">Practice "To Learn"</ToggleButton>
              <ToggleButton value="Known">Practice "Known"</ToggleButton>
            </ToggleButtonGroup>
          </Box>
  
          <Button variant="contained" href="/gre" size="large" sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}>
            Go to GRE Prep
          </Button>
        </Paper>
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
                borderRadius: '12px',
                p: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  border: 'none !important',
                  borderRadius: '10px !important',
                  mx: 0.5,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: quizType === 'Known' ? 'success.main' : 'primary.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                sx={{ 
                  fontWeight: 700, 
                  px: 2, 
                  py: 2.5, 
                  fontSize: '1rem',
                  borderRadius: '12px',
                  borderWidth: '2px',
                  bgcolor: 'background.paper'
                }} 
              />
              <Button 
                startIcon={<MdRefresh />} 
                variant="contained" 
                onClick={handleReset}
                sx={{ 
                  borderRadius: '12px',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(0, 118, 255, 0.2)',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
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
                  className={wrongMatches[w._id] ? "shake-animation" : ""}
                sx={{ 
                  cursor: matches[w._id] ? 'default' : 'pointer',
                  bgcolor: matches[w._id] ? 'success.light' : (selectedWord?._id === w._id ? 'primary.light' : 'background.paper'),
                  color: (matches[w._id] || selectedWord?._id === w._id) ? 'white' : 'text.primary',
                  border: '2px solid',
                  borderRadius: '16px',
                  borderColor: wrongMatches[w._id] ? 'error.main' : (matches[w._id] ? 'success.main' : (selectedWord?._id === w._id ? 'primary.main' : 'divider')),
                  boxShadow: selectedWord?._id === w._id ? '0 8px 16px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: matches[w._id] ? 'none' : 'translateY(-3px)',
                    borderColor: matches[w._id] ? 'success.main' : 'primary.main',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
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
                    className={wrongMatches[m._id] ? "shake-animation" : ""}
                    sx={{ 
                      cursor: isMatched ? 'default' : 'pointer',
                      bgcolor: isMatched ? 'success.light' : (selectedMeaning?._id === m._id ? 'primary.light' : 'background.paper'),
                      color: (isMatched || selectedMeaning?._id === m._id) ? 'white' : 'text.primary',
                      border: '2px solid',
                      borderRadius: '16px',
                      borderColor: (wrongMatches[m._id] && selectedMeaning?._id === m._id) ? 'error.main' : (isMatched ? 'success.main' : (selectedMeaning?._id === m._id ? 'primary.main' : 'divider')),
                      boxShadow: selectedMeaning?._id === m._id ? '0 8px 16px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: isMatched ? 'none' : 'translateY(-3px)',
                        borderColor: isMatched ? 'success.main' : 'primary.main',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
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
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'success.lighter', border: '2px dashed', borderColor: 'success.main', boxShadow: '0 10px 40px rgba(76, 175, 80, 0.1)' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 800, mb: 2 }}>
                Great job! 🎉
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                You have correctly matched all the words. Keep it up to master your GRE vocabulary.
              </Typography>
              <Button 
                size="large" 
                variant="contained" 
                color="success" 
                onClick={handleReset}
                sx={{ 
                  borderRadius: '12px', 
                  px: 5, 
                  py: 1.5, 
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
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
