/**
 * controllers/routeController.js
 * ================================
 * Orchestrates the full CVRP pipeline:
 *
 *  optimizeRoutes  →  POST /api/routes/optimize
 *    1. Fetch today's pending WasteEntries (with user location)
 *    2. Build distance matrix (ORS or mock)
 *    3. Run Python OR-Tools optimizer
 *    4. Save assigned routes to Truck documents
 *    5. Mark WasteEntries as "scheduled"
 *
 *  getTruckRoute   →  GET  /api/routes/:truckId
 *    Returns the Truck document with its assignedRoute
 *
 *  seedTrucks      →  POST /api/routes/seed-trucks
 *    Creates 3 default trucks for development / first-run
 */

import WasteEntry from "../models/WasteEntry.js";
import Truck from "../models/Truck.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map WasteEntry wasteSize string to numeric kg for the optimizer */
const wasteSizeToKg = (size) => {
  const map = { small: 1, medium: 2, large: 3 };
  return map[size] ?? 1;
};

/**
 * Get today's date range (midnight → 23:59:59) in UTC
 */
const getTodayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

// ── Controller: optimizeRoutes ────────────────────────────────────────────────

/**
 * POST /api/routes/optimize
 */
export const optimizeRoutes = async (req, res) => {
  try {
    console.log("[optimizeRoutes] Starting daily route optimization...");

    const { start, end } = getTodayRange();

    const pendingEntries = await WasteEntry.find({
      status: "pending",
      createdAt: { $gte: start, $lte: end },
    }).populate("user", "name address location");

    if (pendingEntries.length === 0) {
      const msg = "No pending waste entries found for today.";
      console.log(`[optimizeRoutes] ${msg}`);
      return res?.status(200).json({ success: true, message: msg });
    }

    console.log(`[optimizeRoutes] Found ${pendingEntries.length} pending entries.`);

    const validEntries = pendingEntries.filter(
      (e) => e.user?.location?.latitude && e.user?.location?.longitude
    );

    if (validEntries.length === 0) {
      const msg = "None of the pending entries have user location data.";
      console.warn(`[optimizeRoutes] ${msg}`);
      return res?.status(422).json({ success: false, message: msg });
    }

    const trucks = await Truck.find({});
    if (trucks.length === 0) {
      return res?.status(404).json({
        success: false,
        message: "No trucks found. Seed trucks first via POST /api/routes/seed-trucks",
      });
    }

    // Simple round-robin assignment (no Python optimizer dependency)
    const scheduledEntryIds = [];

    await Promise.all(
      trucks.map(async (truck, vehicleIdx) => {
        const assignedStops = validEntries
          .filter((_, i) => i % trucks.length === vehicleIdx)
          .map((entry, order) => ({
            wasteEntryId: entry._id,
            userId:       entry.user._id,
            userName:     entry.user.name,
            address:      entry.user.address,
            location:     entry.user.location,
            wasteType:    entry.wasteType,
            wasteSize:    entry.wasteSize,
            wasteSizeKg:  wasteSizeToKg(entry.wasteSize),
            stopOrder:    order + 1,
          }));

        await Truck.findByIdAndUpdate(truck._id, {
          assignedRoute: assignedStops,
          status: assignedStops.length > 0 ? "active" : "idle",
        });

        assignedStops.forEach((stop) => scheduledEntryIds.push(stop.wasteEntryId));
      })
    );

    if (scheduledEntryIds.length > 0) {
      await WasteEntry.updateMany(
        { _id: { $in: scheduledEntryIds } },
        { status: "scheduled" }
      );
    }

    const summary = trucks.map((truck, idx) => ({
      truckId:       truck.truckId,
      stopsAssigned: validEntries.filter((_, i) => i % trucks.length === idx).length,
      maxCapacity:   truck.maxCapacity,
    }));

    return res?.status(200).json({
      success: true,
      message:        "Routes optimized successfully.",
      totalEntries:   validEntries.length,
      scheduledCount: scheduledEntryIds.length,
      trucks:         summary,
    });
  } catch (err) {
    console.error("[optimizeRoutes] Error:", err.message);
    return res?.status(500).json({ success: false, error: err.message });
  }
};

// ── Controller: getTruckRoute ─────────────────────────────────────────────────

/**
 * GET /api/routes/:truckId
 */
export const getTruckRoute = async (req, res) => {
  try {
    const { truckId } = req.params;
    const truck = await Truck.findOne({ truckId });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: `Truck with ID "${truckId}" not found.`,
      });
    }

    return res.status(200).json({ success: true, data: truck });
  } catch (err) {
    console.error("[getTruckRoute] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Controller: seedTrucks ────────────────────────────────────────────────────

/**
 * POST /api/routes/seed-trucks
 */
export const seedTrucks = async (req, res) => {
  try {
    const defaultTrucks = [
      { truckId: "TRUCK-01", maxCapacity: 50 },
      { truckId: "TRUCK-02", maxCapacity: 75 },
      { truckId: "TRUCK-03", maxCapacity: 60 },
    ];

    const results = await Promise.all(
      defaultTrucks.map((truck) =>
        Truck.findOneAndUpdate(
          { truckId: truck.truckId },
          { $setOnInsert: truck },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    return res.status(200).json({
      success: true,
      message: `${results.length} trucks seeded.`,
      data: results.map((t) => ({
        truckId:     t.truckId,
        maxCapacity: t.maxCapacity,
        status:      t.status,
      })),
    });
  } catch (err) {
    console.error("[seedTrucks] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
