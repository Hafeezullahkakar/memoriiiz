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

  const toggleStatus = async (e) => {
    e.stopPropagation();
    const newStatus = singleWord.status === "Known" ? "To Learn" : "Known";
    try {
      const apiUrl = process.env.REACT_APP_URI || 'https://memoriiiz.vercel.app/api';
      const response = await axios.put(`${apiUrl}/updateWord/${singleWord._id}`, {
        status: newStatus
      });
      if (response.data) {
        setWords((prevWords) => 
          prevWords.map((w) => w._id === singleWord._id ? { ...w, status: newStatus } : w)
        );
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating word status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <ReactCardFlip isFlipped={isFlipped2} flipDirection="horizontal">
      <div className="card__ frontt" onClick={handleClick2}>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span 
              onClick={toggleStatus}
              style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                backgroundColor: singleWord.status === 'Known' ? '#4caf50' : '#ff9800',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {singleWord.status || 'To Learn'}
            </span>
        </div>
        <h4>{singleWord?.word}</h4>
      </div>

      <div className="card__" onClick={handleClick2}>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span 
              onClick={toggleStatus}
              style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                backgroundColor: singleWord.status === 'Known' ? '#4caf50' : '#ff9800',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {singleWord.status || 'To Learn'}
            </span>
        </div>
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
