import WasteEntry from "../models/WasteEntry.js";

// Create a new waste entry
export const createWasteEntry = async (req, res) => {
  try {
    const { userId, wasteType, wasteSize } = req.body;

    if (!userId || !wasteType || !wasteSize) {
      return res.status(400).json({ success: false, error: "Please provide userId, wasteType, and wasteSize" });
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
    res.status(400).json({ success: false, error: err.message });
  }
};
