import express from "express";
import { register, login } from "../controllers/authController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", verifyJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Fetch full user profile including points
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        points: user.points || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Redeem reward points
router.post("/redeem", async (req, res) => {
  try {
    const { userId, rewardName, pointsCost } = req.body;
    if (!userId || !pointsCost || !rewardName) {
      return res.status(400).json({ success: false, error: "Missing required fields: userId, rewardName, and pointsCost" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.points < pointsCost) {
      return res.status(400).json({ success: false, error: "Insufficient points" });
    }

    user.points -= pointsCost;
    await user.save();

    // Generate a random high-quality looking voucher claim code
    const claimCode = `WW-${rewardName.replace(/\s+/g, "").substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    res.json({
      success: true,
      points: user.points,
      claimCode,
      message: `Successfully redeemed: ${rewardName}!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
