import WasteEntry from "../models/WasteEntry.js";

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