import express from "express";
import { createWasteEntry } from "../controllers/wasteController.js";

const router = express.Router();

router.post("/", createWasteEntry);

export default router;
