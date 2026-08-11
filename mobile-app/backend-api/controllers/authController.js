import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Register User
export const register = async (req, res) => {
  try {
    let { name, email, password, role, address, location } = req.body;

    if (email) email = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "An account with this email address already exists." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "resident",
      address,
      location: location && location.latitude && location.longitude ? location : undefined,
    });

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        location: user.location,
        points: user.points || 0,
      },
    });
  } catch (err) {
    let errorMessage = err.message;
    if (err.code === 11000) {
      errorMessage = "An account with this email address already exists.";
    }
    res.status(400).json({ success: false, error: errorMessage });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password" });
    }

    email = email.trim().toLowerCase();

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ 
      success: true, 
      token, 
      role: user.role,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        address: user.address,
        points: user.points || 0 
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
