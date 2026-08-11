import express from "express"
import { protect, requireRole } from "../middleware/authMiddleware.js"
import {
  getTodayRoute,
  updateRouteStatus,
  completeStop,
  getRoutes,
  manualGenerate
} from "../controllers/routeController.js"

const router = express.Router()

router.get("/today", protect, requireRole("driver"), getTodayRoute)
router.patch("/:routeId/status", protect, requireRole("driver"), updateRouteStatus)
router.patch("/:routeId/stops/:stopOrder/complete", protect, requireRole("driver"), completeStop)
router.get("/", protect, requireRole("admin", "driver"), getRoutes)
router.post("/generate", protect, requireRole("admin", "driver"), manualGenerate)

export default router
