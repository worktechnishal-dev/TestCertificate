const User = require("../models/User");
const crypto = require("crypto");
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

const forgotPassword = async (req, res) => {
  try {
    const { email = "" } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      res.json({ message: "If the email exists, a reset link has been generated." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    res.json({
      message: "Password reset link generated.",
      resetToken,
      resetUrl: `/reset-password/${resetToken}`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create reset link", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token = "", password = "" } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: "Reset token and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: "Reset link is invalid or expired" });
      return;
    }

    user.passwordHash = hashPassword(password);
    user.resetPasswordToken = "";
    user.resetPasswordExpiresAt = null;
    await user.save();

    res.json({ message: "Password updated successfully. Please login." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

module.exports = {
  forgotPassword,
  login,
  me,
  register,
  resetPassword
};
