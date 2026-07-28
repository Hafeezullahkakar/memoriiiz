const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    words: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Word",
      },
    ],
    pic: {
      type: String,
      default:
        "https://pps.whatsapp.net/v/t61.24694-24/378065211_1258309461536733_5939401187160746792_n.jpg?ccb=11-4&oh=01_AdQX6Onf_EUeDnmUz6RcW2250JW3_gYy-M-atkrXeKpgxg&oe=652E70F4&_nc_sid=000000&_nc_cat=107",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash the password only when it's set / changed. Always call next()
// exactly once — the previous version fell through on modified passwords.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
