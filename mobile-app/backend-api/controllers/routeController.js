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
import { fetchDistanceMatrix } from "../utils/distanceMatrix.js";
import { runOptimizer } from "../utils/runOptimizer.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map WasteEntry wasteSize string to numeric kg for the optimizer */
const wasteSizeToKg = (size) => {
  const map = { small: 1, medium: 2, large: 3 };
  return map[size] ?? 1;
};

/**
 * Get today's date range (midnight → 23:59:59) in UTC
 * so the query always captures entries created "today".
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
 *
 * Main orchestrator for the daily CVRP route-planning workflow.
 * Can also be triggered automatically by the node-cron job in index.js.
 */
export const optimizeRoutes = async (req, res) => {
  try {
    console.log("[optimizeRoutes] Starting daily route optimization...");

    // ── Step 1: Fetch today's pending WasteEntries with user location ─────────
    const { start, end } = getTodayRange();

    const pendingEntries = await WasteEntry.find({
      status: "pending",
      createdAt: { $gte: start, $lte: end },
    }).populate("user", "name address location");

    if (pendingEntries.length === 0) {
      const msg = "No pending waste entries found for today.";
      console.log(`[optimizeRoutes] ${msg}`);
      // Return 200 (not an error) — this is a valid empty-day scenario
      return res?.status(200).json({ success: true, message: msg });
    }

    console.log(
      `[optimizeRoutes] Found ${pendingEntries.length} pending entries.`
    );

    // Filter out entries whose user has no location data
    const validEntries = pendingEntries.filter(
      (e) => e.user?.location?.latitude && e.user?.location?.longitude
    );

    if (validEntries.length === 0) {
      const msg =
        "None of the pending entries have user location data. Please ensure users have latitude/longitude set.";
      console.warn(`[optimizeRoutes] ${msg}`);
      return res?.status(422).json({ success: false, message: msg });
    }

    console.log(
      `[optimizeRoutes] ${validEntries.length} entries have valid coordinates.`
    );

    // ── Step 2: Fetch active trucks ───────────────────────────────────────────
    const trucks = await Truck.find({});
    if (trucks.length === 0) {
      return res?.status(404).json({
        success: false,
        message:
          "No trucks found in the database. Seed trucks first via POST /api/routes/seed-trucks",
      });
    }

    const truckCapacities = trucks.map((t) => t.maxCapacity);

    // ── Step 3: Build coordinate list (depot first, then stops) ───────────────
    const depotLat = parseFloat(process.env.DEPOT_LAT || "6.9271");
    const depotLng = parseFloat(process.env.DEPOT_LNG || "79.8612");

    const depotCoord = { latitude: depotLat, longitude: depotLng };

    // Index 0 = depot, indices 1..n = WasteEntry stops
    const allCoords = [
      depotCoord,
      ...validEntries.map((e) => e.user.location),
    ];

    // waste_sizes[0] = 0 (depot has no waste), rest map to kg
    const wasteSizes = [
      0,
      ...validEntries.map((e) => wasteSizeToKg(e.wasteSize)),
    ];

    // ── Step 4: Fetch the distance matrix ─────────────────────────────────────
    console.log("[optimizeRoutes] Building distance matrix...");
    const distanceMatrix = await fetchDistanceMatrix(allCoords);

    // ── Step 5: Run Python CVRP optimizer ─────────────────────────────────────
    const optimizerPayload = {
      distance_matrix: distanceMatrix,
      waste_sizes: wasteSizes,
      truck_capacities: truckCapacities,
      depot: 0,
    };

    console.log("[optimizeRoutes] Calling Python optimizer...");
    const { routes, total_distance, dropped_nodes } =
      await runOptimizer(optimizerPayload);

    console.log(
      `[optimizeRoutes] Optimization complete. Total distance: ${total_distance}m`
    );

    if (dropped_nodes.length > 0) {
      console.warn(
        `[optimizeRoutes] ${dropped_nodes.length} stop(s) could not be assigned ` +
          `(trucks may be at capacity): indices ${dropped_nodes.join(", ")}`
      );
    }

    // ── Step 6: Save routes to Truck documents ────────────────────────────────
    const scheduledEntryIds = [];

    await Promise.all(
      trucks.map(async (truck, vehicleIdx) => {
        const stopIndices = routes[vehicleIdx] ?? [];

        // Build the rich stop list for storage
        const assignedRoute = stopIndices.map((stopIdx, order) => {
          // stopIdx 1..n maps to validEntries[stopIdx - 1]
          const entry = validEntries[stopIdx - 1];
          return {
            wasteEntryId: entry._id,
            userId:       entry.user._id,
            userName:     entry.user.name,
            address:      entry.user.address,
            location:     entry.user.location,
            wasteType:    entry.wasteType,
            wasteSize:    entry.wasteSize,
            wasteSizeKg:  wasteSizeToKg(entry.wasteSize),
            stopOrder:    order + 1,
          };
        });

        await Truck.findByIdAndUpdate(truck._id, {
          assignedRoute,
          status: assignedRoute.length > 0 ? "active" : "idle",
        });

        // Collect IDs of all successfully scheduled entries
        stopIndices.forEach((idx) => {
          scheduledEntryIds.push(validEntries[idx - 1]._id);
        });
      })
    );

    // ── Step 7: Mark WasteEntries as "scheduled" ──────────────────────────────
    if (scheduledEntryIds.length > 0) {
      await WasteEntry.updateMany(
        { _id: { $in: scheduledEntryIds } },
        { status: "scheduled" }
      );
      console.log(
        `[optimizeRoutes] Marked ${scheduledEntryIds.length} entries as "scheduled".`
      );
    }

    // ── Step 8: Return summary response ───────────────────────────────────────
    const summary = trucks.map((truck, idx) => ({
      truckId:        truck.truckId,
      stopsAssigned:  (routes[idx] ?? []).length,
      maxCapacity:    truck.maxCapacity,
    }));

    return res?.status(200).json({
      success: true,
      message:        "Routes optimized successfully.",
      totalEntries:   validEntries.length,
      scheduledCount: scheduledEntryIds.length,
      droppedCount:   dropped_nodes.length,
      totalDistanceM: total_distance,
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
 * Returns a Truck document (including its assignedRoute) by truckId string.
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

    return res.status(200).json({
      success: true,
      data: truck,
    });
  } catch (err) {
    console.error("[getTruckRoute] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Controller: seedTrucks ────────────────────────────────────────────────────

/**
 * POST /api/routes/seed-trucks
 * Creates default trucks for development. Safe to call multiple times
 * (uses upsert so it won't duplicate).
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
