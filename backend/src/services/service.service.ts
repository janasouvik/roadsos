import { ServiceType } from '@prisma/client';
import { serviceRepository } from '../repositories/service.repository';
import { sortByDistance } from '../utils/geoUtils';
import { ApiError } from '../utils/ApiError';
import { getCache, setCache } from '../config/redis';
import { CACHE_KEYS, CACHE_TTL } from '../constants';

export const serviceProviderService = {
  async findNearby(lat: number, lng: number, radiusKm = 50, type?: string) {
    if (!lat || !lng) throw ApiError.badRequest('Latitude and longitude are required');

    const serviceType = type as ServiceType | undefined;
    const cacheKey = CACHE_KEYS.NEARBY_SERVICES(lat, lng, type ?? 'all');

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) return JSON.parse(cached);

    const providers = await serviceRepository.findNearby(lat, lng, radiusKm, serviceType);
    const sorted = sortByDistance(providers, lat, lng, radiusKm);

    await setCache(cacheKey, JSON.stringify(sorted), CACHE_TTL.MEDIUM);
    return sorted;
  },

  async findByType(type: ServiceType) {
    return serviceRepository.findByType(type);
  },

  async findHospitals(lat?: number, lng?: number) {
    if (lat && lng) return this.findNearby(lat, lng, 50, 'HOSPITAL');
    return serviceRepository.findByType(ServiceType.HOSPITAL);
  },

  async findAmbulances(lat?: number, lng?: number) {
    if (lat && lng) return this.findNearby(lat, lng, 30, 'AMBULANCE');
    return serviceRepository.findByType(ServiceType.AMBULANCE);
  },

  async findPolice(lat?: number, lng?: number) {
    if (lat && lng) return this.findNearby(lat, lng, 30, 'POLICE');
    return serviceRepository.findByType(ServiceType.POLICE);
  },

  async findTowing(lat?: number, lng?: number) {
    if (lat && lng) return this.findNearby(lat, lng, 100, 'TOWING');
    return serviceRepository.findByType(ServiceType.TOWING);
  },
};
