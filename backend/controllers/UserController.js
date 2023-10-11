const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password, displayName, pic } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password,
      displayName,
      pic,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email and pass in controler: ", req.body);

    // validate
    if (!email || !password)
      return res.status(400).json({ msg: "Not all fields have been entered." });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, "memoriiz");

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkTokenValidity = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json({
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  checkTokenValidity,
  getUserProfile,
};
