import { Request, Response } from 'express';
import { serviceProviderService } from '../services/service.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getNearby = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius, type } = req.query as Record<string, string>;
  const services = await serviceProviderService.findNearby(
    parseFloat(lat),
    parseFloat(lng),
    radius ? parseFloat(radius) : 50,
    type,
  );
  ApiResponse.success(res, 'Nearby services fetched', services);
});

export const getHospitals = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query as Record<string, string>;
  const services = await serviceProviderService.findHospitals(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined,
  );
  ApiResponse.success(res, 'Hospitals fetched', services);
});

export const getAmbulances = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query as Record<string, string>;
  const services = await serviceProviderService.findAmbulances(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined,
  );
  ApiResponse.success(res, 'Ambulances fetched', services);
});

export const getPolice = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query as Record<string, string>;
  const services = await serviceProviderService.findPolice(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined,
  );
  ApiResponse.success(res, 'Police stations fetched', services);
});

export const getTowing = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query as Record<string, string>;
  const services = await serviceProviderService.findTowing(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined,
  );
  ApiResponse.success(res, 'Towing services fetched', services);
});
