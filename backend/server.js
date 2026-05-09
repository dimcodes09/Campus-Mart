require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { protect } = require("./middleware/auth");

// Socket
const { initSocket } = require("./socket");

// Route imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const rentalRoutes = require("./routes/rentals");

// ✅ AI Routes
const aiRoutes = require("./ai/aiRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rentals", rentalRoutes);

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
