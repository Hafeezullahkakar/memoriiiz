import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewAllWords.css";
import { 
  Skeleton, 
  Container, 
  Typography, 
  Box, 
  ToggleButton, 
  ToggleButtonGroup,
  useTheme
} from "@mui/material";
import FlipCard from "../components/flipcard/FlipCard";

const GREPage = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("To Learn");
  const theme = useTheme();

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

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredWords = words.filter(word => word.status === filter || (!word.status && filter === "To Learn"));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
            GRE Vocabulary
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Master these high-frequency words commonly found in the GRE exam.
          </Typography>
          
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="word status filter"
            sx={{
              bgcolor: 'background.paper',
              '& .MuiToggleButton-root': {
                px: 4,
                py: 1,
                fontWeight: 700,
                borderRadius: '12px',
                mx: 1,
                border: '1px solid !important',
                borderColor: 'divider !important',
                '&.Mui-selected': {
                  bgcolor: filter === 'Known' ? 'success.main' : 'warning.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: filter === 'Known' ? 'success.dark' : 'warning.dark',
                  }
                }
              }
            }}
          >
            <ToggleButton value="To Learn">
              To Learn
            </ToggleButton>
            <ToggleButton value="Known">
              Known
            </ToggleButton>
          </ToggleButtonGroup>
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
            filteredWords?.map((word) => (
              <div key={word._id} className="cardWrapper">
                <FlipCard singleWord={word} setWords={setWords} />
              </div>
            ))
          )}
        </div>

        {filteredWords.length === 0 && !loading && (
          <Box textAlign="center" mt={8}>
            <Typography variant="h5" color="text.secondary">
              No words found in this category.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GREPage;
