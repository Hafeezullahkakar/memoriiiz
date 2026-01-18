import React, { useState, useCallback } from "react";
import ReactCardFlip from "react-card-flip";

import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
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

  const handleSpeak = (e) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(singleWord?.word);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported in this browser");
    }
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
      <div className="card__ frontt" onClick={handleClick2} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '12px', alignItems: 'center', zIndex: 10 }}>
            <HiOutlineSpeakerWave 
              onClick={handleSpeak}
              style={{ fontSize: '1.6rem', cursor: 'pointer', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
            <span 
              onClick={toggleStatus}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                padding: '5px 12px', 
                borderRadius: '20px', 
                backgroundColor: singleWord.status === 'Known' ? '#4caf50' : '#ff9800',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {singleWord.status || 'To Learn'}
            </span>
        </div>
        <h4 style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>{singleWord?.word}</h4>
      </div>

      <div className="card__" onClick={handleClick2} style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', zIndex: 10 }}>
            <HiOutlineSpeakerWave 
              onClick={handleSpeak}
              style={{ fontSize: '1.6rem', cursor: 'pointer', color: '#1976d2' }}
            />
            <span 
              onClick={toggleStatus}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                padding: '5px 12px', 
                borderRadius: '20px', 
                backgroundColor: singleWord.status === 'Known' ? '#e8f5e9' : '#fff3e0',
                color: singleWord.status === 'Known' ? '#2e7d32' : '#ef6c00',
                border: `1px solid ${singleWord.status === 'Known' ? '#4caf50' : '#ff9800'}`,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {singleWord.status || 'To Learn'}
            </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <b style={{ color: '#1976d2', display: 'block', marginBottom: '4px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Meaning</b> 
            <i style={{ fontSize: '1.1rem', color: '#444' }}>{singleWord?.meaning}</i>
          </div>
          <div>
            <b style={{ color: '#1976d2', display: 'block', marginBottom: '4px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Sentences</b>
            {singleWord?.sentences?.map((sent, index) => {
              return (
                <p key={index} style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#555', lineHeight: '1.5' }}>
                  <span style={{ color: '#1976d2', fontWeight: 'bold', marginRight: '5px' }}>{index + 1}.</span> <i>{sent}</i>
                </p>
              )
            })}
          </div>
        </div>
        <div className="buttonDiv" style={{ position: 'relative', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <RiDeleteBinLine
              onClick={(e) => { e.stopPropagation(); handleDelete(singleWord?._id); }}
              style={{
                fontSize: "1.4rem",
                cursor: "pointer",
                color: '#d32f2f',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <FiEdit
              onClick={(e) => { e.stopPropagation(); handleUpdate(singleWord?._id); }}
              style={{ 
                fontSize: "1.4rem", 
                cursor: "pointer", 
                color: '#1976d2',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
        </div>
      </div>
    </ReactCardFlip>
  );
};

export default FlipCard;
