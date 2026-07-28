const mongoose = require("mongoose");

// Server-side ledger for refresh tokens so we can revoke on logout.
// `jti` is the JWT ID claim on the issued refresh token.
const refreshTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// TTL: auto-purge expired rows.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
