import React from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";
import Hero from "../components/hero/Hero";
function Homepage() {
  return (
    <div className="homepage">
      <Hero />
      <div>{/* <button className="btn_hp">Pick Random Word</button> */}</div>
    </div>
  );
}

export default Homepage;
