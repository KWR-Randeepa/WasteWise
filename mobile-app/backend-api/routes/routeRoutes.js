/**
 * routes/routeRoutes.js
 * ======================
 * API endpoints for the CVRP route planning system.
 *
 * POST /api/routes/seed-trucks  → Create default trucks (dev helper)
 * POST /api/routes/optimize     → Run full CVRP optimization for today
 * GET  /api/routes/:truckId     → Fetch a specific truck's assigned route
 *
 * Note: seed-trucks and optimize are defined BEFORE /:truckId to prevent
 * Express from matching them as truckId parameters.
 */

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
