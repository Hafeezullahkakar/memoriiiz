const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true, index: true },
    homepage: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    lastFetchedAt: { type: Date, default: null },
    lastFetchError: { type: String, default: null },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Feed", feedSchema);
