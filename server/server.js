require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDb = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();
connectDb();

const allowedOrigins = new Set([
  process.env.CLIENT_URL
].filter(Boolean));

const allowedDevHosts = new Set(["localhost", "127.0.0.1", "::1"]);

app.use(
  cors({
    origin(origin, callback) {
      const hostname = origin ? new URL(origin).hostname : "";
      if (!origin || allowedOrigins.has(origin) || allowedDevHosts.has(hostname)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/certificates", authMiddleware, certificateRoutes);

const clientDistPath = path.join(__dirname, "..", "client", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ message: "Route not found" });
      return;
    }

    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
