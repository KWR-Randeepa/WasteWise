import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

// connect DB
await mongoose.connect(process.env.MONGO_URI);

const createDriver = async () => {
  try {
    const email = "newdriver@gmail.com";

    // check if driver already exists
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Driver already exists");
      process.exit();
    }

    // hash password
    const hashedPassword = await bcrypt.hash("driver123", 10);

    // create driver
    const driver = await User.create({
      name: "John Doe (Driver)",
      email: email,
      password: hashedPassword,
      role: "driver",
      zone: "NW",
      location: {
        type: "Point",
        coordinates: [79.8609, 6.9234] // Colombo example
      }
    });

    console.log("✅ Driver created successfully:", driver.email);
    console.log("Password: driver123");
    process.exit();

  } catch (error) {
    console.error("❌ Error creating driver:", error);
    process.exit(1);
  }
};

createDriver();
