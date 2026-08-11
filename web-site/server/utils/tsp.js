export function haversine(coordA, coordB) {
  const R = 6371000
  const [lng1, lat1] = coordA
  const [lng2, lat2] = coordB
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function routeDistance(route, depot) {
  if (route.length === 0) return 0
  let dist = haversine(depot, route[0].coordinates)
  for (let i = 0; i < route.length - 1; i++) {
    dist += haversine(route[i].coordinates, route[i + 1].coordinates)
  }
  dist += haversine(route[route.length - 1].coordinates, depot)
  return dist
}

function twoOptImprove(route, depot) {
  if (route.length <= 2) return route
  let best = [...route]
  let improved = true
  const singlePassOnly = route.length > 100
  let passCount = 0

  while (improved) {
    improved = false
    passCount++
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const newRoute = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1)
        ]
        if (routeDistance(newRoute, depot) < routeDistance(best, depot)) {
          best = newRoute
          improved = true
        }
      }
    }
    if (singlePassOnly && passCount >= 1) break
  }
  return best
}

export function nearestNeighborTSP(depot, stops) {
  if (!stops || stops.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0 }
  }

  const visited = new Array(stops.length).fill(false)
  const route = []
  let current = depot
  let totalDist = 0

  for (let i = 0; i < stops.length; i++) {
    let nearest = -1
    let minDist = Infinity
    for (let j = 0; j < stops.length; j++) {
      if (visited[j]) continue
      const d = haversine(current, stops[j].coordinates)
      if (d < minDist) {
        minDist = d
        nearest = j
      }
    }
    visited[nearest] = true
    route.push(stops[nearest])
    totalDist += minDist
    current = stops[nearest].coordinates
  }

  totalDist += haversine(current, depot)

  const improved = twoOptImprove(route, depot)

  return {
    orderedStops: improved,
    totalDistanceKm: parseFloat((totalDist / 1000).toFixed(2))
  }
}
