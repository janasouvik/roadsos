/**
 * Calculate the distance between two geographic coordinates
 * using the Haversine formula.
 * Returns distance in kilometers.
 */
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filter and sort a list of items with coordinates by distance
 * from a given origin point.
 */
export const sortByDistance = <T extends { latitude: number; longitude: number }>(
  items: T[],
  originLat: number,
  originLon: number,
  maxDistanceKm?: number,
): (T & { distanceKm: number })[] => {
  return items
    .map((item) => ({
      ...item,
      distanceKm: haversineDistance(originLat, originLon, item.latitude, item.longitude),
    }))
    .filter((item) => (maxDistanceKm ? item.distanceKm <= maxDistanceKm : true))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Get a bounding box for a given center and radius (in km)
 * for efficient database queries.
 */
export const getBoundingBox = (
  lat: number,
  lon: number,
  radiusKm: number,
): { minLat: number; maxLat: number; minLon: number; maxLon: number } => {
  const latDelta = radiusKm / 111.32;
  const lonDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
};
