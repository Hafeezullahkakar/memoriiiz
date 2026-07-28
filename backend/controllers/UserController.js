const User = require("../models/UserModel");
const RefreshToken = require("../models/RefreshTokenModel");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");

// Strip sensitive fields before returning a user object.
const publicUser = (u) => {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  delete obj.__v;
  return obj;
};

const issueTokensFor = async (user) => {
  const accessToken = signAccessToken(user._id);
  const { token: refreshToken, jti, expiresAt } = signRefreshToken(user._id);
  await RefreshToken.create({ jti, userId: user._id, expiresAt });
  return { accessToken, refreshToken };
};

// ─── POST /user/register ─────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, pic } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const user = await new User({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      pic,
    }).save();

    const tokens = await issueTokensFor(user);
    res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /user/login ────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const ok = await user.matchPassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const tokens = await issueTokensFor(user);
    res.json({ user: publicUser(user), ...tokens });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /user/refresh ──────────────────────────────────────────────────
// Body: { refreshToken }. Returns { accessToken } (rotation off for MVP).
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (payload.type !== "refresh" || !payload.jti || !payload.sub) {
      return res.status(401).json({ message: "Malformed refresh token" });
    }

    const record = await RefreshToken.findOne({ jti: payload.jti });
    if (!record || record.revoked) {
      return res.status(401).json({ message: "Refresh token revoked or unknown" });
    }
    if (record.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (String(record.userId) !== String(payload.sub)) {
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    const accessToken = signAccessToken(user._id);
    res.json({ accessToken, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /user/logout ───────────────────────────────────────────────────
// Body: { refreshToken }. Revokes the refresh token so it can't refresh again.
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.json({ ok: true });
    try {
      const payload = verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        await RefreshToken.updateOne({ jti: payload.jti }, { $set: { revoked: true } });
      }
    } catch {
      // ignore — even if the token is malformed we shouldn't error on logout
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /user/ (protected) ──────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /user/delete (protected) ─────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    await RefreshToken.deleteMany({ userId: req.user });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refresh,
  logout,
  getUserProfile,
  deleteUser,
};
