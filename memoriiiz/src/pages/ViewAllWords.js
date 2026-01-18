import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewAllWords.css";
import { 
  Container, 
  Typography, 
  Box, 
  useTheme 
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import FlipCard from "../components/flipcard/FlipCard";

const ViewAllWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get(
          `https://memoriiiz.vercel.app/api/getAllWords`
        );
        setWords(response?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
            General Vocabulary
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            A comprehensive collection of all your mastered and upcoming words.
          </Typography>
        </Box>

        <div className="allCards">
          {loading ? (
            <div className="skeleton">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width="100%"
                  height={350}
                  sx={{ 
                    borderRadius: 4, 
                    m: { xs: "10px 1%", md: 2 },
                    width: { xs: "98%", md: 320 }
                  }}
                />
              ))}
            </div>
          ) : (
            words?.map((word) => (
              <div key={word._id} className="cardWrapper">
                <FlipCard singleWord={word} setWords={setWords} />
              </div>
            ))
          )}
        </div>

        {words.length === 0 && !loading && (
          <Box textAlign="center" mt={8}>
            <Typography variant="h5" color="text.secondary">
              Your vocabulary list is currently empty.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ViewAllWords;
