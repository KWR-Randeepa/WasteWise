"""
optimizer.py — CVRP Solver using Google OR-Tools
==================================================
Usage (called by Node.js via child_process.spawn):
    echo '<json>' | python optimizer.py

Input (stdin) JSON schema:
{
  "distance_matrix": [[int, ...], ...],  // n×n matrix (includes depot at index 0)
  "waste_sizes":     [int, ...],          // kg per stop (index 0 = depot = 0)
  "truck_capacities": [int, ...],         // kg capacity per truck
  "depot":           int                  // index of the depot (always 0)
}

Output (stdout) — pure JSON only, never write anything else to stdout:
{
  "routes": [[1, 3, 2], [4, 5]],   // list of routes; each route is a list of
                                    // stop indices (excluding depot endpoints)
  "total_distance": int,            // sum of all route distances
  "dropped_nodes": [int, ...]       // stops that couldn't be assigned
}

All diagnostic/error messages go to stderr.
"""

import sys
import json

def solve_cvrp(distance_matrix, waste_sizes, truck_capacities, depot=0):
    """
    Solve the Capacitated Vehicle Routing Problem using Google OR-Tools.
    Returns a dict with 'routes', 'total_distance', and 'dropped_nodes'.
    """
    # ── Lazy import so the error message stays clean if ortools is missing ──
    try:
        from ortools.constraint_solver import routing_enums_pb2
        from ortools.constraint_solver import pywrapcp
    except ImportError:
        print(
            json.dumps({
                "error": "ortools is not installed. Run: pip install ortools"
            })
        )
        sys.exit(1)

    num_locations = len(distance_matrix)
    num_vehicles  = len(truck_capacities)

    # ── Guard: if only the depot exists, return empty routes ──
    if num_locations <= 1:
        return {
            "routes": [[] for _ in range(num_vehicles)],
            "total_distance": 0,
            "dropped_nodes": [],
        }

    # ── Routing index manager ──
    manager = pywrapcp.RoutingIndexManager(
        num_locations,   # number of nodes (depot + stops)
        num_vehicles,    # number of trucks
        depot            # depot node index
    )
    routing = pywrapcp.RoutingModel(manager)

    # ── Distance callback ──
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node   = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # ── Capacity dimension ──
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return waste_sizes[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,                   # null capacity slack
        truck_capacities,    # vehicle maximum capacities
        True,                # start cumul to zero
        "Capacity",
    )

    # ── Allow dropping nodes (unserved stops) with a large penalty ──
    penalty = 100_000
    for node in range(1, num_locations):  # skip depot at index 0
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)

    # ── Search parameters ──
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.FromSeconds(10)  # max solve time

    # ── Solve ──
    solution = routing.SolveWithParameters(search_params)

    if not solution:
        print(
            json.dumps({
                "error": "No solution found by OR-Tools. Check your distance matrix and capacity constraints."
            })
        )
        sys.exit(1)

    # ── Extract routes ──
    routes         = []
    total_distance = 0
    dropped_nodes  = []

    for vehicle_id in range(num_vehicles):
        index  = routing.Start(vehicle_id)
        route  = []
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != depot:
                route.append(node)
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            total_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id
            )
        routes.append(route)

    # Collect dropped (unassigned) nodes
    for node in range(1, num_locations):
        index = manager.NodeToIndex(node)
        if solution.Value(routing.NextVar(index)) == index:
            dropped_nodes.append(node)

    return {
        "routes": routes,
        "total_distance": total_distance,
        "dropped_nodes": dropped_nodes,
    }


def main():
    # ── Read JSON payload from stdin ──
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            raise ValueError("Empty stdin — no data received from Node.js.")
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    # ── Validate required fields ──
    required_fields = ["distance_matrix", "waste_sizes", "truck_capacities"]
    for field in required_fields:
        if field not in payload:
            print(json.dumps({"error": f"Missing required field: '{field}'"}))
            sys.exit(1)

    distance_matrix  = payload["distance_matrix"]
    waste_sizes      = payload["waste_sizes"]
    truck_capacities = payload["truck_capacities"]
    depot            = payload.get("depot", 0)

    # ── Validate types ──
    if not isinstance(distance_matrix, list) or not all(isinstance(r, list) for r in distance_matrix):
        print(json.dumps({"error": "'distance_matrix' must be a 2D list."}))
        sys.exit(1)

    if len(distance_matrix) != len(waste_sizes):
        print(json.dumps({
            "error": (
                f"Mismatch: distance_matrix has {len(distance_matrix)} nodes "
                f"but waste_sizes has {len(waste_sizes)} entries."
            )
        }))
        sys.exit(1)

    # ── Solve and output ──
    result = solve_cvrp(distance_matrix, waste_sizes, truck_capacities, depot)

    # stdout must contain ONLY valid JSON
    print(json.dumps(result))


if __name__ == "__main__":
    main()
