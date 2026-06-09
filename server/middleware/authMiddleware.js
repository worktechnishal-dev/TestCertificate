const User = require("../models/User");
const { verifyToken } = require("../utils/auth");

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const payload = verifyToken(token);

    if (!payload?.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
};

module.exports = authMiddleware;
