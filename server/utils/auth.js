const crypto = require("crypto");

const base64Url = (value) => Buffer.from(value).toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");

const getSecret = () => {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("AUTH_SECRET is not set. Set it in production environment variables.");
  }

  return "development-auth-secret-change-in-production";
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash = "") => {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  if (hash.length !== candidate.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
};

const signToken = (payload, remember = false) => {
  const expiresInMs = remember ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  const expiresAt = Date.now() + expiresInMs;
  const body = base64Url(JSON.stringify({ ...payload, exp: expiresAt }));
  const signature = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");

  return {
    token: `${body}.${signature}`,
    expiresAt
  };
};

const verifyToken = (token = "") => {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(body));
  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
};

module.exports = {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken
};
