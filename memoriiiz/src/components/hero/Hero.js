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
    color: theme.palette.getContrastText(blue[50]),
    backgroundColor: "white",
    borderRadius: "30px",
    padding: "7px 30px",
    "&:hover": {
      backgroundColor: blue[700],
      color: "white",
    },
  }));

  return (
    <div className="comingsoonpage">
      <div className="left_S">
        {/* <img src={logos} alt="logo" className="logoCS" /> */}
        <div className="det">
          <h2>Memoriiiz: Your Vocabulary Best Friend!</h2>
          <p>
            Elevate your lexicon, one word at a time. Welcome to the ultimate
            destination for avid word learners and memory maestros!
          </p>
          <Link to="/about" className="">
            <ColorButton variant="success" className="getStartedBtn">
              Learn More
            </ColorButton>
            {/* Add new Word */}
          </Link>
        </div>
        {/* <Link to="/wordslist" className="btn_hp">
          View All Words
        </Link> */}

        {/* <Stack spacing={2} direction="row"> */}
        {/* </Stack> */}
      </div>
      <div className="right_S"></div>
    </div>
  );
}

export default Hero;
