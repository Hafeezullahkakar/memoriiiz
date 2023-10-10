// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  words: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Word"
  }]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
