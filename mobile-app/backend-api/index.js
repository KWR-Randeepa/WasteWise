import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
// import cron from "node-cron";

dotenv.config(); // ← must be FIRST before any env vars are read

import authRoutes from "./routes/authRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
// import routeRoutes from "./routes/routeRoutes.js";

// import { optimizeRoutes } from "./controllers/routeController.js";
const app = express();

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // Built-in alternative to bodyParser.json()

// Database Connection
if (!process.env.MONGODB_URL) {
  console.error("❌ MONGODB_URL is not set in .env file!");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ MongoDB CONNECTION ERROR:", err.message);
    console.error("   Check: 1) MONGODB_URL in .env  2) IP whitelisted in Atlas  3) Network connection");
    process.exit(1); // Exit so the error is obvious, not silent
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
// app.use("/api/routes", routeRoutes);   // ← CVRP route planning module

// ── Daily CVRP Cron Job (commented out — enable after routeRoutes is set up) ──
// cron.schedule("0 6 * * *", async () => {
//   console.log("\n⏰ [CRON] Running daily route optimization at 06:00...");
//   try {
//     await optimizeRoutes(null, null);
//     console.log("✅ [CRON] Daily route optimization complete.");
//   } catch (err) {
//     console.error("❌ [CRON] Route optimization failed:", err.message);
//   }
// });

// 404 Handler - return JSON instead of default Express HTML 404 page
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler - return JSON instead of default Express HTML error page
app.use((err, req, res, next) => {
  console.error("❌ Express Unhandled Error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

// Server Entry
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} (0.0.0.0)`);
  console.log(`⏰  Daily route optimization cron scheduled at 06:00 AM`);
});


