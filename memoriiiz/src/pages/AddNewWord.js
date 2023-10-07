import React, { useState, useEffect } from "react";
import "./AddNewWord.css"; // Import the CSS file
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const AddNewWord = () => {
  const location = useLocation();
  const { state } = location;
  // console.log("state is : ", state);

  // const [words, setWords] = useState([]);

  useEffect(() => {
    if (state) {
      const fetchWords = async () => {
        try {
          const response = await axios.get(
            `https://memoriiiz.vercel.app/api/getWordById/${state}`
            // `${process.env.REACT_APP_URI}/getWordById/${state}`
          );



          setWord(response?.data?.word);
          setMeaning(response?.data?.meaning);
          setPicture(response?.data?.picture);
          setVideo(response?.data?.video);
          setSentences([...response?.data?.sentences]);

          console.log("all word property: ", response?.data);

          // console.log("data fetched:", response);
        } catch (error) {
          console.error("Error fetching words:", error);
        }
      };

      fetchWords();
    }
  }, []);

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [picture, setPicture] = useState("");
  const [video, setVideo] = useState("");
  const [sentences, setSentences] = useState([]);
  const [sentence, setSentence] = useState("");

  const URI2 = process.env.REACT_APP_URI;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newWord = {
      word,
      meaning,
      picture,
      video,
      sentences,
    };

    if (!word || !meaning) {
      toast.error("Please type word");
      return;
    }

    if (!state) {
      try {
        // const response = await axios.post(`${URI2}/addWord`, newWord);
        const response = await axios.post(`https://memoriiiz.vercel.app/api/addWord`, newWord);
        console.log("Word added successfully:", response.data);
        toast.success("Word Added Successfully!");
        navigate("/wordlist");
      } catch (error) {
        console.error("Error adding word:", error);
      }
    } else {
      try {
        const response = await axios.put(
          `${URI2}/updateWord/${state}`,
          newWord
        );
        console.log("Word added successfully:", response.data);
        toast.success("Word Editted Successfully!");
        navigate("/wordlist");
      } catch (error) {
        console.error("Error adding word:", error);
      }
    }
    setWord("");
    setMeaning("");
    setPicture("");
    setVideo("");
    setSentences([]);
    setSentence("");
  };

  const addSentence = () => {
    if (sentence.trim() !== "") {
      setSentences([...sentences, sentence]);
      setSentence("");
    }
  };

  return (
    <div className="formPage">
      <div className="form-container">
        <ToastContainer />

        <h2>Word Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="word">Word:</label>
            <input
              type="text"
              id="word"
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="meaning">Meaning:</label>
            <input
              type="text"
              id="meaning"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="picture">Picture:</label>
            <input
              type="text"
              id="picture"
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="video">Video:</label>
            <input
              type="text"
              id="video"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sentence">Sentences:</label>
            <div className="inputButton">
              <input
                type="text"
                id="sentence"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
              />
              <button type="button" onClick={addSentence}>
                Add
              </button>
            </div>
            <ul className="sentences-list">
              {sentences.map((sentence, index) => (
                <li key={index}>
                  {index + 1}. {sentence}
                </li>
              ))}
            </ul>
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewWord;
