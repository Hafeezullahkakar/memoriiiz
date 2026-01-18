import React, { useState, useCallback } from "react";
import ReactCardFlip from "react-card-flip";

import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";

const FlipCard = ({ singleWord, setWords }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isFlipped2, setIsFlipped2] = useState(false);

  // Predefined beautiful gradients for card fronts
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Deep Purple
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)', // Sea Breeze
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Soft Pink
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Soft Blue
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink/Orange
    'linear-gradient(135deg, #5ee7df 0%, #b490d0 100%)', // Teal/Purple
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', // Lime/Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Sunset
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Bright Blue
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', // Violet/Blue
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Sky Blue
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Peach
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // Lavender
    'linear-gradient(135deg, #e0c3fc 8%, #8ec5fc 100%)', // Pastel Blue
    'linear-gradient(135deg, #f067b4 0%, #81ffef 100%)'  // Dreamy
  ];

  // Get a stable gradient based on the word's ID or string hash
  const getGradient = (id) => {
    if (!id) return gradients[0];
    const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charSum % gradients.length];
  };

  const cardGradient = getGradient(singleWord?._id || singleWord?.word);

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
      <div 
        className="card__ frontt" 
        onClick={handleClick2} 
        style={{ 
          position: 'relative',
          backgroundImage: cardGradient,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative circle */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        
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
                backgroundColor: singleWord.status === 'Known' 
                    ? (isDark ? 'rgba(76, 175, 80, 0.9)' : '#4caf50') 
                    : (isDark ? 'rgba(255, 152, 0, 0.9)' : '#ff9800'),
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
        <h4 style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)', margin: 0, zIndex: 2, position: 'relative' }}>{singleWord?.word}</h4>
      </div>

      <div className="card__" onClick={handleClick2} style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', zIndex: 10 }}>
            <HiOutlineSpeakerWave 
              onClick={handleSpeak}
              style={{ fontSize: '1.6rem', cursor: 'pointer', color: theme.palette.primary.main }}
            />
            <span 
              onClick={toggleStatus}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                padding: '5px 12px', 
                borderRadius: '20px', 
                backgroundColor: singleWord.status === 'Known' 
                    ? (isDark ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9') 
                    : (isDark ? 'rgba(255, 152, 0, 0.2)' : '#fff3e0'),
                color: singleWord.status === 'Known' 
                    ? (isDark ? '#81c784' : '#2e7d32') 
                    : (isDark ? '#ffb74d' : '#ef6c00'),
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
            <b style={{ color: theme.palette.primary.main, display: 'block', marginBottom: '4px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Meaning</b> 
            <i style={{ fontSize: '1.1rem', color: theme.palette.text.primary }}>{singleWord?.meaning}</i>
          </div>
          <div>
            <b style={{ color: theme.palette.primary.main, display: 'block', marginBottom: '4px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Sentences</b>
            {singleWord?.sentences?.map((sent, index) => {
              return (
                <p key={index} style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: theme.palette.text.secondary, lineHeight: '1.5' }}>
                  <span style={{ color: theme.palette.primary.main, fontWeight: 'bold', marginRight: '5px' }}>{index + 1}.</span> <i>{sent}</i>
                </p>
              )
            })}
          </div>
        </div>
        <div className="buttonDiv" style={{ position: 'relative', marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
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
                color: theme.palette.primary.main,
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
