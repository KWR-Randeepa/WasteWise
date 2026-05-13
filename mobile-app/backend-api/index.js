import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Highly recommended for mobile-app connections
import authRoutes from "./routes/authRoutes.js"; // Use import instead of require
import wasteRoutes from "./routes/wasteRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // Built-in alternative to bodyParser.json()

// Database Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ CONNECTION ERROR:", err.message);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);

// Server Entry
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} (0.0.0.0)`);
});
