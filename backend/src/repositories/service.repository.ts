import { db } from '../config/database';
import { ServiceType, ServiceProvider } from '@prisma/client';
import { getBoundingBox } from '../utils/geoUtils';

export const serviceRepository = {
  async findNearby(
    lat: number,
    lon: number,
    radiusKm = 50,
    type?: ServiceType,
  ): Promise<ServiceProvider[]> {
    const bbox = getBoundingBox(lat, lon, radiusKm);

    return db.serviceProvider.findMany({
      where: {
        isAvailable: true,
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLon, lte: bbox.maxLon },
        ...(type && { type }),
      },
    });
  },

  async findByType(type: ServiceType): Promise<ServiceProvider[]> {
    return db.serviceProvider.findMany({
      where: { type, isAvailable: true },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string): Promise<ServiceProvider | null> {
    return db.serviceProvider.findUnique({ where: { id } });
  },

  async findAll(params: {
    skip: number;
    take: number;
    type?: ServiceType;
  }): Promise<[ServiceProvider[], number]> {
    const where = params.type ? { type: params.type } : {};
    const [services, total] = await Promise.all([
      db.serviceProvider.findMany({ where, skip: params.skip, take: params.take }),
      db.serviceProvider.count({ where }),
    ]);
    return [services, total];
  },
};
