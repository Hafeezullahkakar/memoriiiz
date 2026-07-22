const mongoose = require("mongoose");

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
    count: Number,
    provider: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Paragraph", paragraphSchema);
