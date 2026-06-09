const User = require("../models/User");
const { hashPassword, signToken, verifyPassword } = require("../utils/auth");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const buildAuthResponse = (user, remember) => {
  const { token, expiresAt } = signToken({ userId: user._id.toString() }, remember);
  return {
    token,
    expiresAt,
    user: sanitizeUser(user)
  };
};

const register = async (req, res) => {
  try {
    const { name = "", email = "", password = "", remember = false } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password)
    });

    res.status(201).json(buildAuthResponse(user, remember));
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email = "", password = "", remember = false } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json(buildAuthResponse(user, remember));
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

const me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

module.exports = {
  login,
  me,
  register
};
