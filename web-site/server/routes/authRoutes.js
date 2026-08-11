import express from "express";
import User from "../models/User.js";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;