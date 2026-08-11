const ZONE_DEPOTS = {
  NW: [79.855, 6.935],
  NE: [79.875, 6.935],
  SW: [79.855, 6.895],
  SE: [79.875, 6.895]
}

export function getDepotCoordinates(zone) {
  if (!ZONE_DEPOTS[zone]) {
    throw new Error(`Unknown zone: ${zone}. Must be one of: NW, NE, SW, SE`)
  }
  return ZONE_DEPOTS[zone]
}
