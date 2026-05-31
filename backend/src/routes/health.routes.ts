import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check API health status
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', healthCheck);

export default router;
