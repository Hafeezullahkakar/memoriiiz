import React from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";
function Homepage() {
  return (
    <div className="homepage">
      <h1>Welcom to Memoriiiz</h1>
      <div>
        <Link to="/addword" className="btn_hp">
          Add new Word
        </Link>
        <Link to="/wordlist" className="btn_hp">
          View All Words
        </Link>

        {/* <button className="btn_hp">Pick Random Word</button> */}
      </div>
    </div>
  );
}

export default Homepage;
