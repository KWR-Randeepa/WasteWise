import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import CollectionSchedule from "./models/CollectionSchedule.js";
import WasteEntry from "./models/WasteEntry.js";
import CollectionRoute from "./models/CollectionRoute.js";
import { generateRouteForZone } from "./services/routeOptimizer.service.js";

dotenv.config();

const seed = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected.");

    // 1. Create/Get Driver
    const driverEmail = "driver@gmail.com";
    let driver = await User.findOne({ email: driverEmail });
    if (!driver) {
      const hashedPassword = await bcrypt.hash("driver123", 10);
      driver = await User.create({
        name: "Test Driver (Amara)",
        email: driverEmail,
        password: hashedPassword,
        role: "driver",
      });
      console.log("✅ Created driver user:", driverEmail);
    } else {
      console.log("ℹ️ Driver user already exists.");
    }

    // 2. Create Collection Schedule for NW Zone mapping to Driver
    await CollectionSchedule.findOneAndUpdate(
      { zone: "NW" },
      {
        zone: "NW",
        collectionDayOfWeek: 4, // Thursday
        assignedDriverId: driver._id,
      },
      { upsert: true, new: true },
    );
    console.log("✅ Collection schedule set for Zone NW assigned to driver.");

    // 3. Create Test Residents inside Colombo with realistic city coordinates
    const residentsData = [
      {
        name: "Sunil Perera",
        email: "sunil@gmail.com",
        address: "124 Galle Rd, Colombo 03",
        lng: 79.8442,
        lat: 6.9184,
      },
      {
        name: "Nimal Fernando",
        email: "nimal@gmail.com",
        address: "56 Baseline Rd, Colombo 08",
        lng: 79.8781,
        lat: 6.9508,
      },
      {
        name: "Kamal Silva",
        email: "kamal@gmail.com",
        address: "78 Grandpass Rd, Colombo 02",
        lng: 79.8609,
        lat: 6.9234,
      },
      {
        name: "Amaya Jayasuriya",
        email: "amaya@gmail.com",
        address: "22 Kynsey Rd, Colombo 08",
        lng: 79.8786,
        lat: 6.9493,
      },
    ];

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    // Clear old route for today to test fresh generation
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    await CollectionRoute.deleteMany({
      zone: "NW",
      collectionDate: { $gte: startOfDay, $lte: endOfDay },
    });
    console.log("🧹 Cleared today's existing collection routes for Zone NW.");

    for (const data of residentsData) {
      let resident = await User.findOne({ email: data.email });
      if (!resident) {
        const hashedPassword = await bcrypt.hash("resident123", 10);
        resident = await User.create({
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: "user",
          address: data.address,
          zone: "NW",
          location: {
            type: "Point",
            coordinates: [data.lng, data.lat], // [longitude, latitude]
          },
        });
        console.log("✅ Created resident:", data.name);
      } else {
        // Update coordinates to make sure they are correct format
        resident.zone = "NW";
        resident.location = {
          type: "Point",
          coordinates: [data.lng, data.lat],
        };
        await resident.save();
        console.log("ℹ️ Updated resident coordinates:", data.name);
      }

      // Create a WasteEntry marked readyForCollection today
      // Delete existing entries for this resident today to avoid duplicate clutter
      await WasteEntry.deleteMany({
        user: resident._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      await WasteEntry.create({
        user: resident._id,
        wasteType: Math.random() > 0.5 ? "solid" : "organic",
        wasteSize: "medium",
        readyForCollection: true,
        scheduledDate: today,
        status: "pending",
        collectionStatus: "pending",
      });
      console.log(
        `✅ Created ready-for-collection waste entry for ${data.name}.`,
      );
    }

    // 4. Create a sample CollectionRoute for Zone NW assigned to the driver
    // so the driver `/today` endpoint will return a usable route for testing.
    const nwResidents = await User.find({ zone: "NW" });
    if (nwResidents && nwResidents.length > 0) {
      // Generate a real route using the optimizer service so road geometry is stored.
      const todayDate = today;
      await generateRouteForZone("NW", todayDate, driver._id);
      console.log(
        "✅ Generated real road-based CollectionRoute for Zone NW and assigned to driver.",
      );
    } else {
      console.log("ℹ️ No NW residents found to create a sample route.");
    }

    console.log("\n=======================================================");
    console.log("🎉 Test Data Seeding Complete successfully!");
    console.log("=======================================================");
    console.log("Use the following credentials to login and test:");
    console.log("-------------------------------------------------------");
    console.log("👨‍✈️ Driver Dashboard:");
    console.log("   URL:      http://localhost:5173/driver");
    console.log(`   Email:     ${driverEmail}`);
    console.log("   Password:  driver123");
    console.log("-------------------------------------------------------");
    console.log("🏢 Admin Dashboard (Route Preview / Generation):");
    console.log("   URL:      http://localhost:5173/admin");
    console.log("   Email:     admin@gmail.com");
    console.log("   Password:  0342236160");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
};

seed();
