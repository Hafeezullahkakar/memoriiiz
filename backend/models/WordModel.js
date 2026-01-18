// models/Word.js

const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: String,
  meaning: String,
  picture: String,
  video: String,
  sentences: [String],
  status: {
    type: String,
    enum: ["To Learn", "Known"],
    default: "To Learn",
  },
  type: {
    type: String,
    default: "General", // To distinguish GRE words from others
  },
});

const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
