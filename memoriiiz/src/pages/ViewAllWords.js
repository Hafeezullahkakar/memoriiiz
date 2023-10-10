import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewAllWords.css";
import Skeleton from "@mui/material/Skeleton";
import FlipCard from "../components/flipcard/FlipCard";

const ViewAllWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get(
          `https://memoriiiz.vercel.app/api/getAllWords`
        );

        // const response = await axios.get(
        //   `${process.env.REACT_APP_URI}/getAllWords`
        // );
        setWords(response?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  const [flippedCards, setFlippedCards] = useState(
    Array(words?.length).fill(false)
  );

  const handleClick = (index) => {
    const newFlippedCards = [...flippedCards];
    newFlippedCards[index] = !newFlippedCards[index];
    setFlippedCards(newFlippedCards);
  };

  return (
    <div className="wordlistpage">
      <h1 style={{ margin: "20px" }}>Word List</h1>

      <div className="allCards">
        {loading ? (
          <div className="skeleton">
            <Skeleton
              variant="rectangular"
              width={300}
              height={300}
              style={{ margin: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              width={300}
              height={300}
              style={{ margin: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              width={300}
              height={300}
              style={{ margin: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              width={300}
              height={300}
              style={{ margin: "10px" }}
            />
          </div>
        ) : (
          words?.map((word, index) => (
            <FlipCard singleWord={word} setWords={setWords} />
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAllWords;
