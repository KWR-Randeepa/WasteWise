import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, role, address} = req.body;
    const user = await User.create({ name, email, password, role, address, });

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name, email, role, address },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.status(200).json({ success: true, token, role: user.role });
};
