import User from "../models/User.js";
import WasteEntry from "../models/WasteEntry.js";
import CollectionRoute from "../models/CollectionRoute.js";
import { nearestNeighborTSP, haversine } from "../utils/tsp.js";
import { minutesToTimeString } from "../utils/timeHelpers.js";

export async function generateRouteForZone(zone, collectionDate, driverId) {
  const startOfDay = new Date(collectionDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(collectionDate);
  endOfDay.setHours(23, 59, 59, 999);

  const entries = await WasteEntry.find({
    readyForCollection: true,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
  }).populate("user");

  const zoneEntries = entries.filter(
    (e) =>
      e.user &&
      e.user.zone === zone &&
      Array.isArray(e.user.location?.coordinates) &&
      e.user.location.coordinates.length === 2,
  );

  if (zoneEntries.length === 0) {
    console.log(
      `[RouteOptimizer] Zone ${zone}: no ready entries for ${collectionDate.toDateString()}`,
    );
    return;
  }

  const skippedUserIds = entries
    .filter(
      (e) =>
        e.user &&
        e.user.zone === zone &&
        (!e.user.location?.coordinates ||
          e.user.location.coordinates.length !== 2),
    )
    .map((e) => e.user._id);

  const stops = zoneEntries.map((e) => ({
    userId: e.user._id,
    coordinates: e.user.location.coordinates,
    address: e.user.address || "Address not set",
    wasteEntryIds: [e._id],
  }));

  // CMC (Colombo Municipal Council) coordinates: [longitude, latitude]
  const depot = [79.8638, 6.9158];

  // 1. Run straight-line Nearest Neighbor TSP as a fallback ordering
  const {
    orderedStops: nnOrderedStops,
    totalDistanceKm: straightLineDistanceKm,
  } = nearestNeighborTSP(depot, stops);

  let optimizedPolyline = [];
  let totalDistanceKm = straightLineDistanceKm;
  let stopsWithTime = [];

  const START_MINUTES = 480;
  const MINUTES_PER_STOP = 5; // Service time per stop in minutes

  try {
    // 2. Preserve optimized visiting order and request road-following geometry
    //    for each consecutive pair: Depot -> stop1, stop1 -> stop2, ..., last -> Depot
    const orderedStops = nnOrderedStops;

    const seq = [depot, ...orderedStops.map((s) => s.coordinates), depot];

    const segmentResults = [];
    let accumulatedMeters = 0;
    let accumulatedSeconds = 0;

    // helper to fetch OSRM route for a pair of coords (lng,lat)
    const fetchSegment = async (from, to) => {
      const url = `http://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
      try {
        const r = await fetch(url);
        const j = await r.json();
        if (j && j.code === "Ok" && j.routes && j.routes.length > 0) {
          return j.routes[0];
        }
        throw new Error(`OSRM segment error: ${j && j.code}`);
      } catch (e) {
        console.error(`[RouteOptimizer] OSRM segment failed: ${e.message}`);
        return null;
      }
    };

    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      const to = seq[i + 1];
      const seg = await fetchSegment(from, to);
      if (seg) {
        segmentResults.push(seg);
        accumulatedMeters += seg.distance || 0;
        accumulatedSeconds += seg.duration || 0;
      } else {
        // fallback to straight line if OSRM segment fails
        const straightMeters = haversine(from, to);
        segmentResults.push({
          geometry: {
            coordinates: [
              [from[0], from[1]],
              [to[0], to[1]],
            ],
          },
          distance: straightMeters,
          duration: (straightMeters / 1000 / 40) * 3600,
        });
        accumulatedMeters += straightMeters;
      }
    }

    // concatenate coordinates avoiding duplicate points between segments
    optimizedPolyline = [];
    for (let i = 0; i < segmentResults.length; i++) {
      const seg = segmentResults[i];
      if (!seg || !seg.geometry || !seg.geometry.coordinates) continue;
      if (optimizedPolyline.length === 0)
        optimizedPolyline.push(...seg.geometry.coordinates);
      else optimizedPolyline.push(...seg.geometry.coordinates.slice(1));
    }

    // compute stopsWithTime using accumulated segment durations
    let segSecondsAccumulator = 0;
    stopsWithTime = orderedStops.map((s, idx) => {
      // segments: 0 -> depot->stop1, 1 -> stop1->stop2, ...
      let secondsToStop = 0;
      for (let j = 0; j <= idx; j++) {
        secondsToStop += segmentResults[j]?.duration || 0;
      }
      const arrivalMinutes = Math.round(START_MINUTES + secondsToStop / 60);
      const arrivalTimeStr = minutesToTimeString(arrivalMinutes);
      return {
        order: idx + 1,
        userId: s.userId,
        coordinates: s.coordinates,
        address: s.address,
        estimatedArrival: arrivalTimeStr,
        wasteEntryIds: s.wasteEntryIds,
      };
    });

    totalDistanceKm = parseFloat((accumulatedMeters / 1000).toFixed(2));
    console.log(
      `[RouteOptimizer] OSRM per-segment routing completed for Zone ${zone}. Distance: ${totalDistanceKm} km.`,
    );
  } catch (err) {
    console.error(
      `[RouteOptimizer] OSRM routing failed (falling back to straight-line):`,
      err.message,
    );

    // Fallback: straight-line path and simple linear ETAs
    optimizedPolyline = [
      depot,
      ...nnOrderedStops.map((s) => s.coordinates),
      depot,
    ];
    totalDistanceKm = straightLineDistanceKm;

    stopsWithTime = nnOrderedStops.map((s, i) => ({
      order: i + 1,
      userId: s.userId,
      coordinates: s.coordinates,
      address: s.address,
      estimatedArrival: minutesToTimeString(
        START_MINUTES + i * MINUTES_PER_STOP,
      ),
      wasteEntryIds: s.wasteEntryIds,
    }));
  }

  await CollectionRoute.findOneAndUpdate(
    { zone, collectionDate: startOfDay },
    {
      zone,
      collectionDate: startOfDay,
      generatedAt: new Date(),
      assignedDriverId: driverId,
      stops: stopsWithTime,
      totalDistanceKm,
      optimizedPolyline,
      skippedUserIds,
      status: "pending",
    },
    { upsert: true, new: true },
  );

  console.log(
    `[RouteOptimizer] Zone ${zone}: route saved — ${stopsWithTime.length} stops, ${totalDistanceKm} km`,
  );
}
