import React, { useState, useCallback } from "react";
import ReactCardFlip from "react-card-flip";

import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const FlipCard = ({ singleWord, setWords }) => {
  const [isFlipped2, setIsFlipped2] = useState(false);

  const handleClick2 = useCallback((e) => {
    e.preventDefault();
    setIsFlipped2((prevState) => !prevState);
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

  return (
    <ReactCardFlip isFlipped={isFlipped2} flipDirection="horizontal">
      <div className="card__ frontt" onClick={handleClick2}>
        <h4>{singleWord?.word}</h4>
      </div>

      <div className="card__" onClick={handleClick2}>
        <div>
          <b>Meaning: </b> <i>{singleWord?.meaning}</i>
        </div>
        <div>
          <b>Sentences: </b>
          <br></br>
          {singleWord?.sentences?.map((sent, index) => {
            return (
              <p>
                {index + 1}. <i>{sent}</i>
                <br></br>
              </p>
            )
          })}
          <div className="buttonDiv">
            <RiDeleteBinLine
              onClick={() => handleDelete(singleWord?._id)}
              style={{
                fontSize: "1.5rem",
                marginRight: "1rem",
                cursor: "pointer",
              }}
            />
            <FiEdit
              onClick={() => handleUpdate(singleWord?._id)}
              style={{ fontSize: "1.5rem", cursor: "pointer" }}
            />
          </div>
          
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default FlipCard;
