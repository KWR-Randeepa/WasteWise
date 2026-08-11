import WasteEntry from "../models/WasteEntry.js";
import User from "../models/User.js";

// Create a new waste entry and award points
export const createWasteEntry = async (req, res) => {
  try {
    const { userId, wasteType, wasteSize } = req.body;

    if (!userId || !wasteType || !wasteSize) {
      return res.status(400).json({ success: false, error: "Please provide userId, wasteType, and wasteSize" });
    }

    // Determine points earned: 1 for small, 2 for medium, 3 for large
    let pointsEarned = 0;
    if (wasteSize === "small") {
      pointsEarned = 1;
    } else if (wasteSize === "medium") {
      pointsEarned = 2;
    } else if (wasteSize === "large") {
      pointsEarned = 3;
    }

    const entry = await WasteEntry.create({
      user: userId,
      wasteType,
      wasteSize,
      pointsEarned,
    });

    // Update user's points in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: pointsEarned } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: entry,
      pointsEarned,
      totalPoints: updatedUser ? updatedUser.points : 0,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all waste entries for a specific user
export const getUserWasteEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await WasteEntry.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
