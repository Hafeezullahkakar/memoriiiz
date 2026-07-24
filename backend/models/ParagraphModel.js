const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const paragraphSchema = new mongoose.Schema(
  {
    paragraph: { type: String, required: true },
    words: [
      {
        _id: false,
        wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word" },
        word: String,
        meaning: String,
      },
    ],
    mcqs: { type: [mcqSchema], default: [] },
    count: Number,
    provider: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Paragraph", paragraphSchema);
