import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewAllWords.css";
import Skeleton from "@mui/material/Skeleton";
import FlipCard from "../components/flipcard/FlipCard";

const GREPage = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("To Learn");

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URI || 'https://memoriiiz.vercel.app/api'}/getWordsByType/GRE`
        );
        setWords(response?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  const filteredWords = words.filter(word => word.status === filter || (!word.status && filter === "To Learn"));

  return (
    <div className="wordlistpage">
      <h1 style={{ margin: "20px" }}>GRE Vocabulary</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={() => setFilter("To Learn")} 
          style={{ 
            padding: "10px 20px", 
            margin: "0 10px", 
            backgroundColor: filter === "To Learn" ? "#ff9800" : "#ddd",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            color: filter === "To Learn" ? "white" : "black"
          }}
        >
          To Learn
        </button>
        <button 
          onClick={() => setFilter("Known")} 
          style={{ 
            padding: "10px 20px", 
            margin: "0 10px", 
            backgroundColor: filter === "Known" ? "#4caf50" : "#ddd",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            color: filter === "Known" ? "white" : "black"
          }}
        >
          Known
        </button>
      </div>

      <div className="allCards">
        {loading ? (
          <div className="skeleton">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton
                    key={i}
                    variant="rectangular"
                    width={300}
                    height={300}
                    style={{ margin: "10px" }}
                />
            ))}
          </div>
        ) : (
          filteredWords?.map((word, index) => (
            <FlipCard key={word._id} singleWord={word} setWords={setWords} />
          ))
        )}
      </div>
      {filteredWords.length === 0 && !loading && (
        <div style={{ marginTop: "50px", fontSize: "1.2rem" }}>
            No words found in this category.
        </div>
      )}
    </div>
  );
};

export default GREPage;
