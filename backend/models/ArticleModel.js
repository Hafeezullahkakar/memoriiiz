const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    source: { type: String, required: true, index: true },
    sourceHomepage: { type: String, default: "" },
    author: { type: String, default: null },
    publishedAt: { type: Date, index: true },
    fetchedAt: { type: Date, default: Date.now },
    image: { type: String, default: null },
    tags: { type: [String], default: [] },
    commentsUrl: { type: String, default: null },
    points: { type: Number, default: null },
  },
  { versionKey: false }
);

// Sort default: newest first.
articleSchema.index({ publishedAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
