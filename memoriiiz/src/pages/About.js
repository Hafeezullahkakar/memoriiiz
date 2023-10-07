import React from "react";
import { MdOutlineConstruction } from "react-icons/md";
function About() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        flexDirection:'column'
      }}
    >
      <MdOutlineConstruction
        style={{
          fontSize: "10rem",
        }}
      />
      <h2>About is in construction!</h2>
    </div>
  );
}

export default About;
