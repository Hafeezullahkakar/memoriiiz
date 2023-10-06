const Word = require("../models/WordModel");

// Create a new word
exports.addWord = async (req, res) => {
  const { word, meaning, picture, video, sentences } = req.body;

  const newWord = new Word({
    word,
    meaning,
    picture,
    video,
    sentences,
  });

  try {
    const savedWord = await newWord.save();
    res.json(savedWord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all words
exports.getAllWords = async (req, res) => {
  try {
    const words = await Word.find();
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific word by ID
exports.getWordById = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    res.json(word);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a word by ID
exports.updateWord = async (req, res) => {
  try {
    const updatedWord = await Word.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedWord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a word by ID
exports.deleteWord = async (req, res) => {
  try {
    const deletedWord = await Word.findByIdAndDelete(req.params.id);
    res.json(deletedWord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
