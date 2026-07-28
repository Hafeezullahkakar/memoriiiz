const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Fallback secret keeps local dev working when JWT_SECRET isn't set.
// In production set JWT_SECRET (and ideally JWT_REFRESH_SECRET) via env.
const ACCESS_SECRET =
  process.env.JWT_SECRET || "memoriiz-dev-only-not-for-prod";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || `${ACCESS_SECRET}-refresh`;

const ACCESS_TTL = "15m";                    // 15 minutes
const REFRESH_TTL_DAYS = 30;                 // 30 days
const REFRESH_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId), type: "access" }, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });

/**
 * Returns { token, jti, expiresAt } — persist jti + expiresAt in the
 * RefreshToken collection so we can revoke.
 */
const signRefreshToken = (userId) => {
  const jti = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  const token = jwt.sign(
    { sub: String(userId), type: "refresh", jti },
    REFRESH_SECRET,
    { expiresIn: `${REFRESH_TTL_DAYS}d`, jwtid: jti }
  );
  return { token, jti, expiresAt };
};

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_TTL_MS,
};
