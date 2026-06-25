/**
 * utils/distanceMatrix.js
 * ========================
 * Builds an n×n distance matrix for the CVRP optimizer.
 *
 * Strategy:
 *  1. If ORS_API_KEY is set in .env  → fetch real road distances from
 *     OpenRouteService Matrix API (https://openrouteservice.org)
 *  2. Otherwise                      → compute a mock Euclidean matrix
 *     scaled to approximate road km (useful for dev/testing with no key)
 */

import axios from "axios";

// ── Conversion helpers ────────────────────────────────────────────────────────

/**
 * Convert degrees to radians.
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Haversine formula — straight-line distance in metres between two lat/lng points.
 * Multiply by ~1.4 to get a rough road-distance approximation.
 */
const haversineMetres = (lat1, lng1, lat2, lng2) => {
  const R = 6_371_000; // Earth radius in metres
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4);
};

// ── Mock matrix ───────────────────────────────────────────────────────────────

/**
 * Build a symmetric distance matrix using Haversine distances.
 * Self-distances are 0.
 *
 * @param {Array<{latitude: number, longitude: number}>} coords
 * @returns {number[][]} n×n integer matrix (metres)
 */
const buildMockMatrix = (coords) => {
  const n = coords.length;
  return coords.map((from, i) =>
    coords.map((to, j) => {
      if (i === j) return 0;
      return haversineMetres(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude
      );
    })
  );
};

// ── Real ORS matrix ───────────────────────────────────────────────────────────

/**
 * Fetch a real road-distance matrix from OpenRouteService.
 * Docs: https://openrouteservice.org/dev/#/api-docs/matrix
 *
 * @param {Array<{latitude: number, longitude: number}>} coords
 * @param {string} apiKey - ORS API key from environment
 * @returns {Promise<number[][]>} n×n integer matrix (metres)
 */
const fetchOrsMatrix = async (coords, apiKey) => {
  // ORS expects [longitude, latitude] order
  const locations = coords.map((c) => [c.longitude, c.latitude]);

  const response = await axios.post(
    "https://api.openrouteservice.org/v2/matrix/driving-car",
    {
      locations,
      metrics: ["distance"],
      resolve_locations: false,
      units: "m",
    },
    {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10_000, // 10 s timeout
    }
  );

  // ORS returns distances as floats; round to integers for OR-Tools
  return response.data.distances.map((row) => row.map(Math.round));
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build a distance matrix for the given set of coordinates.
 * Automatically selects real ORS data or mock Euclidean distances.
 *
 * @param {Array<{latitude: number, longitude: number}>} coords
 *   The first element should be the DEPOT location.
 * @returns {Promise<number[][]>} n×n integer distance matrix in metres
 */
export const fetchDistanceMatrix = async (coords) => {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey || apiKey === "your_openrouteservice_api_key_here") {
    console.warn(
      "[distanceMatrix] ORS_API_KEY not set — using mock Euclidean matrix."
    );
    return buildMockMatrix(coords);
  }

  try {
    console.log(
      `[distanceMatrix] Fetching real ORS matrix for ${coords.length} locations...`
    );
    const matrix = await fetchOrsMatrix(coords, apiKey);
    console.log("[distanceMatrix] ORS matrix fetched successfully.");
    return matrix;
  } catch (err) {
    console.error(
      "[distanceMatrix] ORS API call failed — falling back to mock matrix:",
      err.message
    );
    return buildMockMatrix(coords);
  }
};
