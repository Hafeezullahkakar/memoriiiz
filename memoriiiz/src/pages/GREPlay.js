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
  const [category, setCategory] = useState("GRE"); // "GRE" or "General"

  // MCQ State
  const [mcqQuiz, setMcqQuiz] = useState(null);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqResult, setMcqResult] = useState(null); // 'correct' | 'wrong'
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqFinished, setMcqFinished] = useState(false);

  useEffect(() => {
    fetchWords();
  }, [category]);

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
      const endpoint = category === "GRE" ? "getWordsByType/GRE" : "getAllWords";
      const response = await axios.get(
        `${process.env.REACT_APP_URI || 'https://memoriiiz.vercel.app/api'}/${endpoint}`
      );
      setWords(response?.data || []);
      const filtered = (response?.data || []).filter(w => 
        quizType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
        generateMcqQuiz(filtered);
      } else {
        setCurrentQuiz(null);
        setMcqQuiz(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("Error loading words");
      setLoading(false);
    }
  };

  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null && newCategory !== category) {
      setCategory(newCategory);
      // fetchWords will be triggered by useEffect
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

  const generateMcqQuiz = (availableWords) => {
    const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const quiz = selected.map((word) => {
      // Pick 3 random wrong meanings
      const otherMeanings = availableWords
        .filter((w) => w._id !== word._id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.meaning);
      
      const options = [...otherMeanings, word.meaning].sort(() => 0.5 - Math.random());
      
      return {
        word: word,
        options: options,
        correctMeaning: word.meaning
      };
    });

    setMcqQuiz(quiz);
    setCurrentMcqIndex(0);
    setSelectedMcqOption(null);
    setMcqResult(null);
    setMcqScore(0);
    setMcqFinished(false);
  };

  const handleQuizTypeChange = (event, newType) => {
    if (newType !== null && newType !== quizType) {
      setQuizType(newType);
      const filtered = words.filter(w => 
        newType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
        generateMcqQuiz(filtered);
      } else {
        setCurrentQuiz(null);
        setMcqQuiz(null);
      }
    }
  };

  const handleMcqOptionSelect = (option) => {
    if (mcqResult) return;

    setSelectedMcqOption(option);
    const isCorrect = option === mcqQuiz[currentMcqIndex].correctMeaning;

    if (isCorrect) {
      setMcqResult('correct');
      setMcqScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.8 },
        colors: [theme.palette.success.main, theme.palette.primary.main]
      });
    } else {
      setMcqResult('wrong');
    }

    setTimeout(() => {
      if (currentMcqIndex < 4) {
        setCurrentMcqIndex(prev => prev + 1);
        setSelectedMcqOption(null);
        setMcqResult(null);
      } else {
        setMcqFinished(true);
      }
    }, 1200);
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
      generateMcqQuiz(filtered);
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
            You need at least 5 words in '{category}' marked as '{quizType}' to start the quiz.
          </Typography>
          
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={category}
                exclusive
                onChange={handleCategoryChange}
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
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="GRE">GRE Prep</ToggleButton>
                <ToggleButton value="General">General Vocab</ToggleButton>
              </ToggleButtonGroup>

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
                <ToggleButton value="To Learn">To Learn</ToggleButton>
                <ToggleButton value="Known">Known</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
  
          <Button variant="contained" href={category === "GRE" ? "/gre" : "/wordslist"} size="large" sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}>
            Go to {category === "GRE" ? "GRE Prep" : "General Vocabulary"}
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
            {category === "GRE" ? "GRE Play: Matching Quiz" : "Vocabulary Play: Matching Quiz"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Match the {category === "GRE" ? "GRE" : "vocabulary"} words with their correct meanings.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={category}
                exclusive
                onChange={handleCategoryChange}
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
                      bgcolor: 'secondary.main',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="GRE">GRE Prep</ToggleButton>
                <ToggleButton value="General">General Vocab</ToggleButton>
              </ToggleButtonGroup>

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
            </Box>

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

        {/* MCQ Quiz Section */}
        <Box sx={{ mt: 12, pt: 8, borderTop: '2px solid', borderColor: 'divider' }}>
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
              Multiple Choice Challenge
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 2, color: 'text.primary' }}>
              {category === "GRE" ? "GRE MCQ: Master Definitions" : "Vocabulary MCQ: Master Definitions"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Pick the correct meaning for the displayed word.
            </Typography>
          </Box>

          {mcqQuiz && !mcqFinished ? (
            <Container maxWidth="md">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Chip 
                  label={`Question: ${currentMcqIndex + 1}/5`} 
                  variant="outlined"
                  sx={{ fontWeight: 700, borderRadius: '8px', border: '2px solid', borderColor: 'divider' }}
                />
                <Chip 
                  label={`MCQ Score: ${mcqScore}`} 
                  color="secondary"
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              </Box>

              <Card sx={{ 
                borderRadius: '24px', 
                p: 4, 
                mb: 4, 
                textAlign: 'center',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none'
              }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {mcqQuiz[currentMcqIndex].word.word}
                </Typography>
              </Card>

              <Grid container spacing={2}>
                {mcqQuiz[currentMcqIndex].options.map((option, index) => {
                  const isSelected = selectedMcqOption === option;
                  const isCorrect = option === mcqQuiz[currentMcqIndex].correctMeaning;
                  
                  let bgColor = 'background.paper';
                  let borderColor = 'divider';
                  let textColor = 'text.primary';

                  if (mcqResult && isSelected) {
                    if (isCorrect) {
                      bgColor = 'success.light';
                      borderColor = 'success.main';
                      textColor = 'white';
                    } else {
                      bgColor = 'error.light';
                      borderColor = 'error.main';
                      textColor = 'white';
                    }
                  } else if (mcqResult && isCorrect) {
                    bgColor = 'success.lighter';
                    borderColor = 'success.main';
                  }

                  return (
                    <Grid item xs={12} key={index}>
                      <Card 
                        onClick={() => handleMcqOptionSelect(option)}
                        sx={{ 
                          cursor: mcqResult ? 'default' : 'pointer',
                          bgcolor: bgColor,
                          color: textColor,
                          border: '2px solid',
                          borderColor: borderColor,
                          borderRadius: '16px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: mcqResult ? 'none' : 'translateX(8px)',
                            borderColor: mcqResult ? borderColor : 'primary.main',
                          },
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        <CardContent sx={{ py: '20px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            border: '2px solid', 
                            borderColor: isSelected ? 'inherit' : 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + index)}
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                            {option}
                          </Typography>
                          {mcqResult && isCorrect && <MdCheckCircle size={24} color={isSelected ? "white" : theme.palette.success.main} />}
                          {mcqResult && isSelected && !isCorrect && <MdCancel size={24} color="white" />}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Container>
          ) : mcqFinished ? (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Paper elevation={0} sx={{ 
                p: 6, 
                borderRadius: '24px', 
                bgcolor: mcqScore >= 4 ? 'success.lighter' : 'background.paper', 
                border: '2px dashed', 
                borderColor: mcqScore >= 4 ? 'success.main' : 'divider',
              }}>
                <Typography variant="h4" color={mcqScore >= 4 ? "success.main" : "text.primary"} sx={{ fontWeight: 800, mb: 2 }}>
                  {mcqScore >= 4 ? "Excellent Work! 🏆" : "Keep Practicing! 📚"}
                </Typography>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Your MCQ Score: {mcqScore}/5
                </Typography>
                <Button 
                  size="large" 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => generateMcqQuiz(words.filter(w => quizType === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)))}
                  sx={{ 
                    borderRadius: '12px', 
                    px: 5, 
                    py: 1.5, 
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  Restart MCQ
                </Button>
              </Paper>
            </Box>
          ) : (
             <Box textAlign="center" py={4}>
               <Typography color="text.secondary">Loading quiz or not enough words...</Typography>
             </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default GREPlay;
