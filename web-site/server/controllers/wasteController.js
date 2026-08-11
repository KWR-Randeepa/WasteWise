import mongoose from "mongoose";
import WasteEntry from "../models/WasteEntry.js";
import CollectionRoute from "../models/CollectionRoute.js";


// ✅ CREATE WASTE ENTRY
export const createWasteEntry = async (req, res) => {
  try {
    const { userId, wasteType, wasteSize } = req.body;

    if (!userId || !wasteType || !wasteSize) {
      return res.status(400).json({
        success: false,
        error: "Please provide userId, wasteType, and wasteSize",
      });
    }

    const entry = await WasteEntry.create({
      user: userId,
      wasteType,
      wasteSize,
    });

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ MARK ENTRY AS READY FOR COLLECTION
export const markReady = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { scheduledDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ success: false, error: "Invalid entryId" });
    }

    const parsedDate = new Date(scheduledDate);
    if (!scheduledDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, error: "scheduledDate is required and must be a valid date" });
    }

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (parsedDate < todayMidnight) {
      return res.status(400).json({ success: false, error: "scheduledDate must be >= today" });
    }

    const entry = await WasteEntry.findById(entryId);
    if (!entry) return res.status(404).json({ success: false, error: "Entry not found" });

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Forbidden: not your entry" });
    }

    entry.readyForCollection = true;
    entry.scheduledDate = parsedDate;
    await entry.save();

    // Check if route already generated for this user's zone + date
    const user = await (await import("../models/User.js")).default.findById(entry.user);
    let routeAlreadyGenerated = false;
    if (user && user.zone) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const existingRoute = await CollectionRoute.findOne({
        zone: user.zone,
        collectionDate: { $gte: startOfDay, $lte: endOfDay }
      });
      routeAlreadyGenerated = !!existingRoute;
    }

    return res.status(200).json({
      message: "Marked as ready",
      entryId: entryId,
      ...(routeAlreadyGenerated ? { routeAlreadyGenerated: true } : {})
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ GET ALL WASTE ENTRIES
export const getWasteEntries = async (req, res) => {
  try {
    const entries = await WasteEntry.find().populate(
      "user",
      "name email role address"
    );

    res.json(entries);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};