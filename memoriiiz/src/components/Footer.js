import React from "react";
import { Box, Container, Typography, Link, Stack, useTheme, Grid } from "@mui/material";
import { MdAutoAwesome } from "react-icons/md";

function Footer() {
  const theme = useTheme();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 6, 
        px: 2, 
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(10, 25, 41, 0.8)',
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, color: 'primary.main' }}>
              <MdAutoAwesome size={24} />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '.1rem', color: theme.palette.text.primary }}>
                Memoriiiz
              </Typography>
            </Stack>
            <Typography variant="body2">
              Master your vocabulary with science-backed learning techniques. 
              The ultimate tool for GRE, TOEFL, and lifelong learners.
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
              Product
            </Typography>
            <Stack spacing={1}>
              <Link href="/wordslist" underline="none" color="inherit">General Vocabulary</Link>
              <Link href="/gre" underline="none" color="inherit">GRE Prep</Link>
              <Link href="/addword" underline="none" color="inherit">Contribute Word</Link>
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
              Company
            </Typography>
            <Stack spacing={1}>
              <Link href="/about" underline="none" color="inherit">About Us</Link>
              <Link href="#" underline="none" color="inherit">Contact</Link>
              <Link href="#" underline="none" color="inherit">Privacy Policy</Link>
            </Stack>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Memoriiiz. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
