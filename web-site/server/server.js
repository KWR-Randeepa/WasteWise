import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fileUpload from "express-fileupload";
import wasteRoutes from "./routes/wasteRoutes.js";

// 🔹 Load env variables


// 🔹 Initialize app
const app = express();
app.use(fileUpload());

// 🔹 Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Import Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/waste", wasteRoutes);
// 🔹 Root Route
app.get("/", (req, res) => {
  res.send("🚀 Waste Wise API is running...");
});

// 🔹 API Routes
app.use("/api/auth", authRoutes);

// 🔹 404 Handler (optional but good practice)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔹 Global Error Handler (important)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Server Error",
  });
});

// 🔹 MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// 🔹 Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

