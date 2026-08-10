import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Highly recommended for mobile-app connections
import os from "os";
import authRoutes from "./routes/authRoutes.js"; // Use import instead of require
import wasteRoutes from "./routes/wasteRoutes.js";

dotenv.config();
const app = express();

// Helper to get local network IP addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

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
  console.log(`🚀 Backend Server is running on port ${PORT}`);
  console.log(`   - Localhost:        http://localhost:${PORT}`);
  console.log(`   - Android Emulator: http://10.0.2.2:${PORT}`);
  const ips = getLocalIpAddresses();
  ips.forEach((ip) => {
    console.log(`   - Network (Wi-Fi):  http://${ip}:${PORT}`);
  });
});

