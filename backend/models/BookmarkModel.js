const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },
    notes: { type: String, default: "" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);
