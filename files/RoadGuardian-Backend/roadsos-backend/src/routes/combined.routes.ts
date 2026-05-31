import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler, sendSuccess } from '../utils/apiError';
import { validate, updateProfileSchema, contactSchema, createSosSchema, nearbySchema } from '../validators';
import { sosService } from '../services/sos.service';
import { serviceProviderService } from '../services/service.service';
import { sosRateLimiter } from '../middlewares/rateLimiter';
import prisma from '../database';
import { ServiceType } from '@prisma/client';

// ============================
// USER ROUTES
// ============================
export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, fullName: true, email: true, phone: true, avatar: true, role: true, isVerified: true, lastLogin: true, createdAt: true },
  });
  sendSuccess(res, user);
}));

userRouter.patch('/profile', validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: req.body,
    select: { id: true, fullName: true, email: true, phone: true, avatar: true },
  });
  sendSuccess(res, user, 'Profile updated');
}));

userRouter.delete('/delete-account', asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.user!.userId } });
  sendSuccess(res, null, 'Account deleted');
}));

// ============================
// EMERGENCY CONTACT ROUTES
// ============================
export const contactRouter = Router();
contactRouter.use(authenticate);

contactRouter.post('/', validate(contactSchema), asyncHandler(async (req, res) => {
  const contact = await prisma.emergencyContact.create({
    data: { ...req.body, userId: req.user!.userId },
  });
  sendSuccess(res, contact, 'Emergency contact added', 201);
}));

contactRouter.get('/', asyncHandler(async (req, res) => {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, contacts);
}));

contactRouter.patch('/:id', validate(contactSchema), asyncHandler(async (req, res) => {
  const contact = await prisma.emergencyContact.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: req.body,
  });
  sendSuccess(res, contact, 'Contact updated');
}));

contactRouter.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.emergencyContact.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  sendSuccess(res, null, 'Contact deleted');
}));

// ============================
// SOS ROUTES
// ============================
export const sosRouter = Router();
sosRouter.use(authenticate);

sosRouter.post('/create', sosRateLimiter, validate(createSosSchema), asyncHandler(async (req, res) => {
  const sos = await sosService.create(req.user!.userId, req.body);
  sendSuccess(res, sos, 'SOS alert triggered!', 201);
}));

sosRouter.get('/my-requests', asyncHandler(async (req, res) => {
  const { page = '1', limit = '10' } = req.query as any;
  const result = await sosService.getMyRequests(req.user!.userId, +page, +limit);
  sendSuccess(res, result.requests, 'Requests fetched', 200, result.meta);
}));

sosRouter.get('/:id', asyncHandler(async (req, res) => {
  const sos = await sosService.getById(req.params.id, req.user!.userId);
  sendSuccess(res, sos);
}));

sosRouter.patch('/cancel/:id', asyncHandler(async (req, res) => {
  const sos = await sosService.cancel(req.params.id, req.user!.userId);
  sendSuccess(res, sos, 'SOS cancelled');
}));

// ============================
// SERVICE ROUTES
// ============================
export const serviceRouter = Router();

serviceRouter.get('/nearby', validate(nearbySchema, 'query'), asyncHandler(async (req, res) => {
  const { latitude, longitude, radius, type } = req.query as any;
  const result = await serviceProviderService.getNearby(+latitude, +longitude, +radius, type);
  sendSuccess(res, result);
}));

const serviceTypeMap: Record<string, ServiceType> = {
  hospitals: 'HOSPITAL',
  ambulances: 'AMBULANCE',
  police: 'POLICE',
  towing: 'TOWING',
  rescue: 'RESCUE',
};

Object.entries(serviceTypeMap).forEach(([path, type]) => {
  serviceRouter.get(`/${path}`, asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.query as any;
    const result = await serviceProviderService.getByType(type, latitude ? +latitude : undefined, longitude ? +longitude : undefined);
    sendSuccess(res, result);
  }));
});

// ============================
// NOTIFICATION ROUTES
// ============================
export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get('/', asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  sendSuccess(res, notifications);
}));

notificationRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isRead: true },
  });
  sendSuccess(res, null, 'Marked as read');
}));

notificationRouter.patch('/mark-all-read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  sendSuccess(res, null, 'All notifications marked as read');
}));

// ============================
// ADMIN ROUTES
// ============================
export const adminRouter = Router();
import { authorize } from '../middlewares/auth.middleware';
adminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

adminRouter.get('/users', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', search } = req.query as any;
  const skip = (+page - 1) * +limit;
  const where = search ? {
    OR: [
      { fullName: { contains: search, mode: 'insensitive' as any } },
      { email: { contains: search, mode: 'insensitive' as any } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: +limit, select: { id: true, fullName: true, email: true, phone: true, role: true, isVerified: true, isBlocked: true, lastLogin: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  sendSuccess(res, users, 'Users fetched', 200, { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) });
}));

adminRouter.patch('/block-user/:id', asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked: true } });
  sendSuccess(res, null, 'User blocked');
}));

adminRouter.patch('/unblock-user/:id', asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked: false } });
  sendSuccess(res, null, 'User unblocked');
}));

adminRouter.delete('/delete-user/:id', asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'User deleted');
}));

adminRouter.get('/sos-requests', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', status } = req.query as any;
  const skip = (+page - 1) * +limit;
  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.sosRequest.findMany({ where: where as any, skip, take: +limit, include: { user: { select: { fullName: true, email: true, phone: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.sosRequest.count({ where: where as any }),
  ]);
  sendSuccess(res, requests, 'SOS requests', 200, { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) });
}));

adminRouter.get('/analytics', asyncHandler(async (_req, res) => {
  const [totalUsers, totalSos, pendingSos, completedSos, verifiedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.sosRequest.count(),
    prisma.sosRequest.count({ where: { status: 'PENDING' } }),
    prisma.sosRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { isVerified: true } }),
  ]);

  const sosByType = await prisma.sosRequest.groupBy({
    by: ['emergencyType'],
    _count: { emergencyType: true },
  });

  sendSuccess(res, {
    users: { total: totalUsers, verified: verifiedUsers },
    sos: { total: totalSos, pending: pendingSos, completed: completedSos },
    sosByType: sosByType.map(s => ({ type: s.emergencyType, count: s._count.emergencyType })),
  }, 'Analytics fetched');
}));
