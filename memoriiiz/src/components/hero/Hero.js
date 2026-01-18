import React from "react";
import "./Hero.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Link } from "react-router-dom";
// import logos from "./logoCS.svg";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { red, blue } from "@mui/material/colors";

function Hero() {
  const ColorButton = styled(Button)(({ theme }) => ({
    color: "white",
    backgroundColor: "#1976d2",
    borderRadius: "8px",
    padding: "12px 35px",
    fontSize: "1.1rem",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  }));

  return (
    <div className="comingsoonpage">
      <div className="left_S">
        <div className="det">
          <h2>Master Your Vocabulary with Memoriiiz</h2>
          <p>
            The smartest way to learn and retain new words. Whether you're 
            preparing for GRE, TOEFL, or just expanding your horizon, 
            we help you make it stick.
          </p>
          <Stack spacing={2} direction="row">
            <Link to="/wordslist" style={{ textDecoration: 'none' }}>
              <ColorButton variant="contained" className="getStartedBtn">
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
                  marginTop: "10px",
                  borderWidth: "2px",
                  "&:hover": { borderWidth: "2px" }
                }}
              >
                Learn More
              </Button>
            </Link>
          </Stack>
        </div>
      </div>
      <div className="right_S"></div>
    </div>
  );
}

export default Hero;
