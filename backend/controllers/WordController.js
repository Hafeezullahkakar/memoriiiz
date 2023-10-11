const Word = require("../models/WordModel");

// Create a new word
const jwt = require("jsonwebtoken");

exports.addWord = async (req, res) => {
  console.log("inside add wordtop;;;;")
  const { word, meaning, picture, video, sentences } = req.body;
  console.log("inside addwrod controller: ", req.boy)
  console.log("heaeder addwrod controller: ", req.header)

  // Get the user ID from the token
  const token = req.header("x-auth-token");
  console.log("token in add word from header: ", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, "memoriiz");
    const userId = decoded.id;

    // Create a new word linked to the user ID
    const newWord = new Word({
      word,
      meaning,
      picture,
      video,
      sentences,
      user: userId, // Associate the word with the user
    });

    const savedWord = await newWord.save();
   
    // Add the word's ID to the user's list of words
    await User.findByIdAndUpdate(userId, { $push: { words: savedWord._id } });

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
