import express from "express";
import { register, login } from "../controllers/authController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", verifyJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
