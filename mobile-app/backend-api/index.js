import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Highly recommended for mobile-app connections
import cron from "node-cron";

import authRoutes from "./routes/authRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

// Import the optimizer function for cron job (called without req/res)
import { optimizeRoutes } from "./controllers/routeController.js";

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
app.use("/api/routes", routeRoutes);   // ← CVRP route planning module

// ── Daily CVRP Cron Job ──────────────────────────────────────────────────────
// Runs every day at 06:00 AM (server local time) to auto-optimize collection routes.
// Schedule format: second(opt) minute hour day-of-month month day-of-week
cron.schedule("0 6 * * *", async () => {
  console.log("\n⏰ [CRON] Running daily route optimization at 06:00...");
  try {
    // Pass null for req/res — the controller handles this gracefully
    await optimizeRoutes(null, null);
    console.log("✅ [CRON] Daily route optimization complete.");
  } catch (err) {
    console.error("❌ [CRON] Route optimization failed:", err.message);
  }
});

// Server Entry
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} (0.0.0.0)`);
  console.log(`⏰  Daily route optimization cron scheduled at 06:00 AM`);
});

