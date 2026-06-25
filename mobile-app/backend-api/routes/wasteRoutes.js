import express from "express";
import { createWasteEntry, getUserWasteEntries } from "../controllers/wasteController.js";

const router = express.Router();

router.post("/", createWasteEntry);
router.get("/user/:userId", getUserWasteEntries);

export default router;
