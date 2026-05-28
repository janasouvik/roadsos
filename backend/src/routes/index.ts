import { Router } from 'express';
import { env } from '../config/env';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import sosRoutes from './sos.routes';
import contactRoutes from './contact.routes';
import serviceRoutes from './service.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const router = Router();

const API_PREFIX = `/api`;

// Mount all route groups
router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/sos`, sosRoutes);
router.use(`${API_PREFIX}/contacts`, contactRoutes);
router.use(`${API_PREFIX}/services`, serviceRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);

export default router;
