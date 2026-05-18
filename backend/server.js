require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const conditionRoutes = require("./routes/conditionRoutes")
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { protect } = require("./middleware/auth");

// Socket
const { initSocket } = require("./socket");

// Route imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const rentalRoutes = require("./routes/rentals");
const adminRoutes = require("./routes/admin");
const mailRoutes = require("./routes/mail");
const userRoutes = require("./routes/user");

// ✅ AI Routes
const aiRoutes = require("./ai/aiRoutes");

// Connect to MongoDB
connectDB();

const app = express();

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
};

// ─── Core Middleware ────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/condition", conditionRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/user", userRoutes);

// AI routes. Keep /ai for compatibility and /api/ai for the frontend api client.
app.use("/api/ai", aiRoutes);
app.use("/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running." });
});

app.post("/api/socket/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Socket is reserved for realtime chat and domain events.",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Create Server + Socket ─────────────────────────────────────────
const server = http.createServer(app);
initSocket(server);

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
