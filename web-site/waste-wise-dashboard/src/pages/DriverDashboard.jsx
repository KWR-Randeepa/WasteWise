import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
// ✅ Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// CMC coordinates [latitude, longitude] for map markers/routing comparison
const CMC_MAP_LATLNG = [6.9158, 79.8638];

// Helper to find the index of the coordinate in optimizedPolyline closest to the target
const findClosestIndex = (polyline, target) => {
  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < polyline.length; i++) {
    const dist =
      Math.pow(polyline[i][0] - target[0], 2) +
      Math.pow(polyline[i][1] - target[1], 2);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
};

// Helper to get angle in degrees between two LatLngs for direction arrows
const getAngle = (c1, c2) => {
  const dy = c2[0] - c1[0];
  const dx = c2[1] - c1[1];
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const createStopIcon = (order, status) => {
  const colors = {
    completed: "#10b981",
    current: "#f59e0b",
    pending: "#2563eb",
  };
  const color = colors[status] || colors.pending;
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};color:#fff;font-weight:800;border:2px solid white;box-shadow:0 0 0 2px rgba(255,255,255,0.45);">${order}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

export default function DriverDashboard() {
  const [route, setRoute] = useState(null);
  const [activeStop, setActiveStop] = useState(1);
  const [completedStops, setCompletedStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [routeZone, setRouteZone] = useState("NW");
  const [routeDate, setRouteDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showRouteDebug, setShowRouteDebug] = useState(false);

  const getToken = () => {
    const info = JSON.parse(localStorage.getItem("userInfo") || "null");
    return info?.token || "";
  };

  const fetchRoute = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/api/routes?zone=${routeZone}&date=${routeDate}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok && data.routes && data.routes.length > 0) {
        setRoute(data.routes[0]);
        setCompletedStops([]);
        setActiveStop(1);
      } else {
        setRoute(null);
        setCompletedStops([]);
        setActiveStop(1);
        if (!res.ok)
          setFetchError(data.error || data.message || JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch route:", err);
      setRoute(null);
      setFetchError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/routes/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zone: routeZone, date: routeDate }),
      });
      if (res.ok) {
        alert(`Route generation started for Zone ${routeZone}`);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || "Failed to generate route"}`);
      }
    } catch (err) {
      console.error("Failed to trigger generation:", err);
    }
  };

  useEffect(() => {
    const todayKey = `wastewise_driver_route_${new Date().toISOString().split("T")[0]}`;
    const cached = localStorage.getItem(todayKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setRoute(parsed);
      setRouteZone(parsed.zone || "NW");
      setLoading(false);
      return;
    }

    const token = getToken();
    fetch("http://localhost:5000/api/routes/today", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.route) {
          localStorage.setItem(todayKey, JSON.stringify(data.route));
          setRoute(data.route);
          setRouteZone(data.route.zone || "NW");
          setCompletedStops([]);
        } else {
          // If the driver's /today endpoint returns no route, attempt to
          // load any generated route for the selected zone/date so the map
          // still displays (useful when routes were created by admin).
          fetchRoute();
        }
      })
      .catch((err) => console.error("Failed to fetch route:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteStop = async (stopOrder) => {
    if (!route) return;
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/api/routes/${route._id}/stops/${stopOrder}/complete`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.nextStop) setActiveStop(data.nextStop.order);
      setCompletedStops((prev) => [...new Set([...prev, stopOrder])]);
      if (data.routeCompleted) {
        setRoute((prev) => ({ ...prev, status: "completed" }));
      }
    } catch (err) {
      console.error("Failed to complete stop:", err);
    }
  };

  const polylinePositions = route
    ? route.optimizedPolyline.map(([lng, lat]) => [lat, lng])
    : [];
  const centerPosition = polylinePositions[0] || [6.9271, 79.8612];

  return (
    <div className="flex flex-col lg:flex-row h-[90vh] font-sans bg-slate-50 text-slate-800">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full lg:w-96 flex flex-col bg-white border-r border-slate-200 shadow-lg relative z-20 overflow-y-auto">
        {/* TITLE */}
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-2xl font-black tracking-tight">Driver Panel</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
            Optimized Route Checklist
          </p>
        </div>

        {/* LOAD & GENERATE ROUTE CONTROLS */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Route Settings
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Zone
              </label>
              <select
                value={routeZone}
                onChange={(e) => setRouteZone(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 p-3 rounded-xl bg-white shadow-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="NW">NW — North West</option>
                <option value="NE">NE — North East</option>
                <option value="SW">SW — South West</option>
                <option value="SE">SE — South East</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <input
                type="date"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 p-2.5 rounded-xl bg-white shadow-sm outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={fetchRoute}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              Load Route
            </button>
            <button
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              Generate Route
            </button>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                window.open("/driver", "_blank");
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition active:scale-95"
            >
              Open Driver View
            </button>
          </div>
        </div>

        {/* ROUTE SUMMARY & LIST OF STOPS */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm font-bold text-slate-400 animate-pulse">
                Loading route details...
              </p>
            </div>
          ) : route ? (
            <div className="space-y-6">
              {/* Route Info Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
                <h4 className="text-lg font-black">Zone {route.zone}</h4>
                <div className="flex gap-4 mt-2 text-xs text-slate-300 font-semibold">
                  <span>📏 {route.totalDistanceKm} km</span>
                  <span>📍 {route.stops.length} stops</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span>Status:</span>
                  <span
                    className={`font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      route.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : route.status === "in_progress"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {route.status}
                  </span>
                </div>
              </div>

              {/* DEBUG: quick route summary */}
              <div className="mt-3 text-xs text-slate-500">
                <button
                  onClick={() => setShowRouteDebug((s) => !s)}
                  className="text-[11px] font-bold underline text-slate-700"
                >
                  {showRouteDebug ? "Hide" : "Show"} route debug
                </button>

                {showRouteDebug && (
                  <div className="mt-2 bg-white p-3 rounded-md text-[12px] text-slate-800 border">
                    <div>
                      <strong>ID:</strong> {route._id}
                    </div>
                    <div>
                      <strong>Stops:</strong> {route.stops?.length || 0}
                    </div>
                    <div>
                      <strong>Polyline points:</strong>{" "}
                      {route.optimizedPolyline?.length || 0}
                    </div>
                    <div className="break-words mt-2">
                      <strong>Sample polyline (first 3):</strong>
                      <pre className="text-[11px] mt-1">
                        {JSON.stringify(
                          (route.optimizedPolyline || []).slice(0, 3),
                          null,
                          0,
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Stop Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Stops Progress
                </h4>

                {route.stops.map((stop) => {
                  const isCurrent = stop.order === activeStop;
                  const isCompleted =
                    stop.order < activeStop || route.status === "completed";

                  return (
                    <div
                      key={stop.order}
                      onClick={() => !isCompleted && setActiveStop(stop.order)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : isCompleted
                            ? "bg-slate-100 border-slate-200 opacity-60"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                            Stop #{stop.order} · {stop.estimatedArrival}
                          </strong>
                          <span className="text-sm font-bold text-slate-800 block mt-1 leading-snug">
                            {stop.address}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-md">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      {isCurrent && route.status !== "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteStop(stop.order);
                          }}
                          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition shadow active:scale-95 cursor-pointer"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-slate-400">
                No route active for this zone/date.
              </p>
              <p className="text-xs text-slate-400">
                Choose settings above, click "Generate Route" and then "Load
                Route" to start.
              </p>
              {fetchError && (
                <div className="mt-4 bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  <strong className="block text-[11px]">API Error:</strong>
                  <div className="break-words">{fetchError}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* INTERACTIVE MAP PANEL */}
      <div className="flex-1 h-[60vh] lg:h-full relative z-10">
        <MapContainer
          center={centerPosition}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {route && (
            <>
              {(() => {
                // Find indices corresponding to first and last stop
                const firstStop = route.stops[0];
                const lastStop = route.stops[route.stops.length - 1];

                const index1 = firstStop
                  ? findClosestIndex(polylinePositions, [
                      firstStop.coordinates[1],
                      firstStop.coordinates[0],
                    ])
                  : 0;

                const indexN = lastStop
                  ? findClosestIndex(polylinePositions, [
                      lastStop.coordinates[1],
                      lastStop.coordinates[0],
                    ])
                  : polylinePositions.length - 1;

                // Split route into Outgoing, Collection, and Return paths
                const outgoingPath = polylinePositions.slice(0, index1 + 1);
                const collectionPath = polylinePositions.slice(
                  index1,
                  indexN + 1,
                );
                const returnPath = polylinePositions.slice(indexN);

                // Calculate arrow coordinates and bearings
                // Draw an arrow marker every 30 points along the polyline
                const arrowMarkers = [];
                const interval = 30;
                for (
                  let i = 10;
                  i < polylinePositions.length - 10;
                  i += interval
                ) {
                  const c1 = polylinePositions[i];
                  const c2 =
                    polylinePositions[i + 5] || polylinePositions[i + 1];
                  const angle = getAngle(c1, c2);
                  arrowMarkers.push({
                    id: `arrow-${route._id}-${i}`,
                    position: c1,
                    angle: angle,
                  });
                }

                return (
                  <>
                    {/* Outgoing Path (Blue) */}
                    {outgoingPath.length > 0 && (
                      <Polyline
                        positions={outgoingPath}
                        color="#2563EB"
                        weight={5}
                        dashArray="5, 10"
                      />
                    )}

                    {/* Collection Path (Emerald) */}
                    {collectionPath.length > 0 && (
                      <Polyline
                        positions={collectionPath}
                        color="#10B981"
                        weight={5}
                      />
                    )}

                    {/* Return Path (Rose Red) */}
                    {returnPath.length > 0 && (
                      <Polyline
                        positions={returnPath}
                        color="#F43F5E"
                        weight={5}
                        dashArray="5, 10"
                      />
                    )}

                    {/* Directional arrows */}
                    {arrowMarkers.map((arrow) => (
                      <Marker
                        key={arrow.id}
                        position={arrow.position}
                        icon={L.divIcon({
                          className: "bg-transparent border-none",
                          html: `<div style="transform: rotate(${arrow.angle}deg); color: #1E293B; font-size: 16px; font-weight: bold; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; user-select: none; pointer-events: none;">➔</div>`,
                          iconSize: [16, 16],
                          iconAnchor: [8, 8],
                        })}
                      />
                    ))}

                    {/* CMC Depot Marker */}
                    <Marker
                      position={CMC_MAP_LATLNG}
                      icon={L.divIcon({
                        className: "bg-transparent border-none",
                        html: `<div style="background-color: #312E81; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"><span style="color: white; font-size: 10px; font-weight: 900;">🏛️</span></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                      })}
                    >
                      <Popup>
                        <strong>Colombo Municipal Council (CMC)</strong>
                        <br />
                        Route Start & End Depot
                      </Popup>
                    </Marker>

                    {/* Collection Stops */}
                    {route.stops.map((stop) => {
                      const isCompleted =
                        route.status === "completed" ||
                        stop.order < activeStop ||
                        completedStops.includes(stop.order);
                      const isCurrent = stop.order === activeStop;
                      const icon = createStopIcon(
                        stop.order,
                        isCompleted
                          ? "completed"
                          : isCurrent
                            ? "current"
                            : "pending",
                      );

                      return (
                        <Marker
                          key={stop.order}
                          position={[stop.coordinates[1], stop.coordinates[0]]}
                          icon={icon}
                        >
                          <Popup>
                            <div className="font-sans">
                              <strong className="text-emerald-600">
                                Stop #{stop.order}
                              </strong>
                              <div className="font-bold my-1">
                                {stop.address}
                              </div>
                              <div className="text-xs text-gray-500 font-semibold">
                                ETA: {stop.estimatedArrival}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {isCompleted
                                  ? "Completed"
                                  : isCurrent
                                    ? "Current stop"
                                    : "Pending"}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </>
                );
              })()}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
