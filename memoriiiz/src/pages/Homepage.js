import React from "react";
import "./Homepage.css";
import Hero from "../components/hero/Hero";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  useTheme 
} from "@mui/material";
import { 
  MdQuiz, 
  MdCollectionsBookmark, 
  MdPsychology,
  MdBarChart 
} from "react-icons/md";

function Homepage() {
  const theme = useTheme();

  const sections = [
    {
      title: "Interactive Learning",
      description: "Flip cards, practice pronunciation, and engage with real-world sentence examples.",
      icon: <MdCollectionsBookmark size={40} color={theme.palette.primary.main} />
    },
    {
      title: "GRE Optimized",
      description: "Specifically designed for high-frequency GRE vocabulary mastery.",
      icon: <MdQuiz size={40} color={theme.palette.primary.main} />
    },
    {
      title: "Science-Backed",
      description: "Utilize spaced repetition principles to ensure words stay in your long-term memory.",
      icon: <MdPsychology size={40} color={theme.palette.primary.main} />
    },
    {
      title: "Track Progress",
      description: "Mark words as 'Known' or 'To Learn' and see your vocabulary grow day by day.",
      icon: <MdBarChart size={40} color={theme.palette.primary.main} />
    }
  ];

  return (
    <div className="homepage">
      <Hero />
      
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
              Why Choose Memoriiiz
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
              Master Language with Confidence
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {sections.map((section, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>{section.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 12, bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(10, 25, 41, 0.4)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Students studying together"
                sx={{ width: '100%', borderRadius: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Your Learning Journey
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, color: 'text.primary' }}>
                How Memoriiiz Works
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</Box>
                  Explore Word Lists
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Browse through our curated GRE high-frequency word lists designed for maximum impact.
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</Box>
                  Interactive Practice
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Flip cards to reveal meanings, listen to pronunciations, and see words in context with example sentences.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</Box>
                  Track Mastery
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Mark words as known or to-learn. Our system helps you focus on what you need to study most.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
}

export default Homepage;
