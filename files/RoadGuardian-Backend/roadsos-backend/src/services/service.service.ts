import prisma from '../database';
import { ServiceType } from '@prisma/client';

// Haversine formula for distance calculation
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export class ServiceProviderService {

  async getNearby(latitude: number, longitude: number, radiusKm = 10, type?: ServiceType) {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        isAvailable: true,
        ...(type && { type }),
      },
    });

    const withDistance = providers
      .map((p) => ({
        ...p,
        distance: haversineDistance(latitude, longitude, p.latitude, p.longitude),
      }))
      .filter((p) => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((p) => ({
        ...p,
        distanceText: `${p.distance.toFixed(1)} km`,
        distanceMeters: Math.round(p.distance * 1000),
      }));

    return withDistance;
  }

  async getByType(type: ServiceType, latitude?: number, longitude?: number) {
    const providers = await prisma.serviceProvider.findMany({
      where: { type, isAvailable: true },
    });

    if (latitude && longitude) {
      return providers
        .map((p) => ({
          ...p,
          distance: haversineDistance(latitude, longitude, p.latitude, p.longitude),
          distanceText: `${haversineDistance(latitude, longitude, p.latitude, p.longitude).toFixed(1)} km`,
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return providers;
  }
}

export const serviceProviderService = new ServiceProviderService();
