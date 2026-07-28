const { verifyAccessToken } = require("../utils/tokens");

/**
 * Verifies the JWT access token from either:
 *   - Authorization: Bearer <token>   (preferred)
 *   - x-auth-token: <token>           (legacy)
 * On success sets req.user = <userId>.
 */
const auth = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.header("authorization") || req.header("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }
    if (!token) token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
    if (!payload?.sub) {
      return res.status(401).json({ message: "Malformed token" });
    }
    req.user = payload.sub;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = auth;
