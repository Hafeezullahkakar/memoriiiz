// models/Word.js

const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: String,
  meaning: String,
  picture: String,
  video: String,
  sentences: [String],
});

const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
