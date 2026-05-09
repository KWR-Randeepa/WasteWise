import jwt from "jsonwebtoken";

export default function verifyJWT(req, res, next) {
  // Get token from header
  const header = req.header("Authorization");

  // Check if token exists
  if (!header) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
    });
  }

  try {
    // Remove "Bearer "
    const token = header.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Save user data inside request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}