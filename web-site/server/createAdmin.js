import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

// connect DB
await mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    const email = "admin@gmail.com";

    // check if admin already exists
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    // hash password
    const hashedPassword = await bcrypt.hash("0342236160", 10);

    // create admin
    const admin = await User.create({
      name: "System Admin",
      email: email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created successfully:", admin.email);
    process.exit();

  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();