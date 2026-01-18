import React from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Box, Typography, Container, useTheme } from "@mui/material";

function Hero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const ColorButton = styled(Button)(({ theme }) => ({
    color: "white",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "8px",
    padding: "12px 35px",
    fontSize: "1.1rem",
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 4px 14px 0 rgba(0, 118, 255, 0.39)",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  }));

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
  };

  const slides = [
    {
      title: "Master Your Vocabulary with Memoriiiz",
      description: "The smartest way to learn and retain new words. Whether you're preparing for GRE, TOEFL, or just expanding your horizon, we help you make it stick.",
      image: "https://images.pexels.com/photos/3363111/pexels-photo-3363111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      title: "Excel in Your Exams",
      description: "Comprehensive GRE word lists and interactive cards designed to help you reach your target score faster.",
      image: "https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      title: "Learn Anywhere, Anytime",
      description: "Our platform is optimized for all devices, ensuring your study sessions are always within reach.",
      image: "https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
  ];

  return (
    <Box className="hero-slider-container">
      <Slider {...sliderSettings}>
        {slides.map((slide, index) => (
          <div key={index}>
            <Box 
              sx={{ 
                height: { xs: '70vh', md: '80vh' }, 
                position: 'relative',
                display: 'flex !important',
                alignItems: 'center',
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
              }}
            >
              <Container maxWidth="lg">
                <Box sx={{ maxWidth: '700px' }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2, 
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.9, 
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {slide.description}
                  </Typography>
                  <Stack spacing={2} direction="row">
                    <Link to="/wordslist" style={{ textDecoration: 'none' }}>
                      <ColorButton variant="contained">
                        Get Started
                      </ColorButton>
                    </Link>
                    <Link to="/about" style={{ textDecoration: 'none' }}>
                      <Button 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: "8px", 
                          padding: "12px 35px", 
                          fontSize: "1.1rem",
                          color: 'white',
                          borderColor: 'white',
                          borderWidth: "2px",
                          textTransform: 'none',
                          fontWeight: 600,
                          "&:hover": { 
                            borderWidth: "2px",
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </Link>
                  </Stack>
                </Box>
              </Container>
            </Box>
          </div>
        ))}
      </Slider>
    </Box>
  );
}

export default Hero;
