import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ViewAllWords.css";
import ReactCardFlip from "react-card-flip";
import Skeleton from "@mui/material/Skeleton";

import { BsPhoneFlip } from "react-icons/bs";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { Typography } from "@mui/material";

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
        // console.log("data fetched:", response);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios
        .delete(`https://memoriiiz.vercel.app/api/deleteWord/${id}`)
        // .delete(`${process.env.REACT_APP_URI}/deleteWord/${id}`)
        .then((r) => {
          setWords((prevWords) => prevWords.filter((word) => word._id !== id));
          toast.success("word deleted successfully!");
        });
    } catch (error) {
      console.error(`Error deleting word with ID ${id}:`, error);
    }
  };

  const navigate = useNavigate();

  const handleUpdate = (id) => {
    // console.log("id in viewall: ", id);
    navigate("/addword", { state: id });
  };

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
      <h1>Word List</h1>

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
            <ReactCardFlip
              isFlipped={flippedCards[index]}
              flipDirection="vertical"
              key={index}
            >
              <div className="card__ frontt">
                <h4>{word?.word}</h4>{" "}
                <button className="btn" onClick={() => handleClick(index)}>
                  Show Details
                </button>
              </div>

              <div className="card__">
                <p>
                  <b>Meaning: </b> <i>{word?.meaning}</i>
                </p>
                <p>
                  <b>Sentences: </b>
                  <br></br>
                  {word?.sentences?.map((sent, index) => {
                    return (
                      <p>
                        {index + 1}. <i>{sent}</i>
                        <br></br>
                      </p>
                    );
                  })}
                </p>
                <div className="buttonDiv">
                  {/* <button className="btn" onClick={() => handleClick(index)}> */}
                  <BsPhoneFlip
                    onClick={() => handleClick(index)}
                    style={{
                      fontSize: "1.5rem",
                      marginRight: "1rem",
                      cursor: "pointer",
                    }}
                  />
                  {/* </button> */}
                  {/* <button className="btn" onClick={() => handleClick(index)}> */}
                  <RiDeleteBinLine
                    onClick={() => handleDelete(word?._id)}
                    style={{
                      fontSize: "1.5rem",
                      marginRight: "1rem",
                      cursor: "pointer",
                    }}
                  />
                  {/* </button> */}
                  {/* <button className="btn" onClick={() => handleClick(index)}> */}
                  <FiEdit
                    onClick={() => handleUpdate(word?._id)}
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                  />
                  {/* </button> */}
                </div>
              </div>
            </ReactCardFlip>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAllWords;
