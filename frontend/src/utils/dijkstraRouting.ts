export interface Position {
  lat: number;
  lng: number;
}

export interface RoutingResult {
  path: [number, number][]; // [lat, lng][] for Leaflet Polyline
  distance: number; // total path distance in km
  duration: number; // ETA in seconds
  executionTimeMs: number;
  isFallback: boolean;
}

// Haversine formula to compute great-circle distance between two points in km (used as absolute fallback)
export function haversineDistance(p1: Position, p2: Position): number {
  const R = 6371; // earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Runs OSRM Routing API to find the shortest path from start coordinates to end coordinates
export async function findShortestPath(start: Position, end: Position): Promise<RoutingResult> {
  const startTime = performance.now();
  let isFallback = false;
  let pathCoords: [number, number][] = [];
  let distanceKm = 0;
  let durationSec = 0;

  try {
    // OSRM API requires coordinates in lon,lat order
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API responded with HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Extract geometry (GeoJSON is [lon, lat], Leaflet needs [lat, lon])
      const coords = route.geometry.coordinates;
      pathCoords = coords.map((c: [number, number]) => [c[1], c[0]]);
      
      distanceKm = route.distance / 1000; // OSRM returns meters
      durationSec = route.duration; // OSRM returns seconds
    } else {
      throw new Error(`OSRM API returned no routes or error code: ${data.code}`);
    }
  } catch (error) {
    console.warn("OSRM API failed, generating straight-line fallback:", error);
    isFallback = true;
    
    // Absolute fallback: straight line
    pathCoords = [
      [start.lat, start.lng],
      [end.lat, end.lng],
    ];
    distanceKm = haversineDistance(start, end);
    // Rough estimate for fallback ETA assuming 30 km/h speed
    durationSec = (distanceKm / 30) * 3600; 
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  return {
    path: pathCoords,
    distance: parseFloat(distanceKm.toFixed(3)),
    duration: durationSec,
    executionTimeMs,
    isFallback,
  };
}
