// controllers/userController.js

const User = require("../models/User");

exports.addWord = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newWord = new Word({
      word: req.body.word,
      meaning: req.body.meaning,
      picture: req.body.picture,
      video: req.body.video,
      sentences: req.body.sentences,
    });

    await newWord.save();
    user.words.push(newWord);
    await user.save();

    res.status(201).json({ message: "Word added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
