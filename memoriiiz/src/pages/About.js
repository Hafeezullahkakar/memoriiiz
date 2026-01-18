import React from "react";
import { Container, Typography, Grid, Paper, Box, useTheme } from "@mui/material";
import { MdOutlinePsychology, MdAutoAwesome, MdSpeed } from "react-icons/md";

function About() {
  const theme = useTheme();
  const features = [
    {
      icon: <MdOutlinePsychology size={40} color={theme.palette.primary.main} />,
      title: "Spaced Repetition",
      description: "Our algorithm ensures you review words at the perfect time to maximize long-term retention."
    },
    {
      icon: <MdAutoAwesome size={40} color={theme.palette.primary.main} />,
      title: "Interactive Cards",
      description: "Engage with words through beautiful flip cards, complete with meanings and example sentences."
    },
    {
      icon: <MdSpeed size={40} color={theme.palette.primary.main} />,
      title: "Fast & Efficient",
      description: "Quickly add new words and track your progress as you master your vocabulary goals."
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={10}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'text.primary' }}>
            About Memoriiiz
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Memoriiiz is your ultimate companion in the journey of vocabulary mastery. 
            Designed for learners who want to make every new word stick forever.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  textAlign: 'center', 
                  borderRadius: 4,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)' },
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Box mb={2}>{feature.icon}</Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  {feature.title}
                </Typography>
                <Typography color="textSecondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box mt={12} p={6} sx={{ bgcolor: 'background.paper', borderRadius: 8, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                We believe that language is the most powerful tool a person can possess. 
                Our mission is to empower students, professionals, and language enthusiasts 
                to express themselves with precision and confidence.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Whether you're preparing for high-stakes exams like the GRE or simply 
                wanting to read more complex literature, Memoriiiz provides the framework 
                you need to succeed.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Books"
                sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default About;
