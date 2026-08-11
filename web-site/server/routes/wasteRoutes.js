import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";

import {
  createWasteEntry,
  getWasteEntries,
  markReady
} from "../controllers/wasteController.js";


const router = express.Router();

// ✅ CREATE WASTE
router.post("/", createWasteEntry);

// ✅ GET ALL WASTE
router.get("/", getWasteEntries);

// ✅ MARK WASTE ENTRY READY FOR COLLECTION
router.patch("/:entryId/ready", protect, requireRole("user"), markReady);

export default router;