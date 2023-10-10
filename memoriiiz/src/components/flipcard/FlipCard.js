import React, { useState, useCallback } from "react";
import ReactCardFlip from "react-card-flip";

const FlipCard = ({ cardfront, cardBack }) => {
  const [isFlipped2, setIsFlipped2] = useState(false);

  const handleClick2 = useCallback((e) => {
    e.preventDefault();
    setIsFlipped2((prevState) => !prevState);
  }, []);

  return (
    <ReactCardFlip isFlipped={isFlipped2} flipDirection="vertical">
      <div className="card__ frontt" onClick={handleClick2}>
        Word: <i>{cardfront}</i>
      </div>

      <div className="card__" onClick={handleClick2}>
        Meaning: <i>{cardBack}</i>
      </div>
    </ReactCardFlip>
  );
};

export default FlipCard;
