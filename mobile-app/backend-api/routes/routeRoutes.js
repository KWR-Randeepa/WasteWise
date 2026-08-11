import express from "express";
import {
  optimizeRoutes,
  getTruckRoute,
  seedTrucks,
} from "../controllers/routeController.js";

const router = express.Router();

// ── Dev helper: seed default trucks ──────────────────────────────────────────
router.post("/seed-trucks", seedTrucks);

// ── Trigger route optimization ────────────────────────────────────────────────
router.post("/optimize", optimizeRoutes);

// ── Get a truck's assigned route ──────────────────────────────────────────────
router.get("/:truckId", getTruckRoute);

export default router;
