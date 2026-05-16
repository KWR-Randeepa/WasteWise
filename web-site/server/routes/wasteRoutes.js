import express from "express";

import {
  createWasteEntry,
  getWasteEntries,
} from "../controllers/wasteController.js";

const router = express.Router();

// ✅ CREATE WASTE
router.post("/", createWasteEntry);

// ✅ GET ALL WASTE
router.get("/", getWasteEntries);

export default router;