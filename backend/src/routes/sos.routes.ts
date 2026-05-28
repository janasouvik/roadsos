import { Router } from 'express';
import * as sosController from '../controllers/sos.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSosSchema } from '../validators/sos.validator';
import { sosLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.use(authenticateUser);

router.post('/create', sosLimiter, validate(createSosSchema), sosController.createSos);
router.get('/my-requests', sosController.getMyRequests);
router.get('/:id', sosController.getSosById);
router.patch('/cancel/:id', sosController.cancelSos);

export default router;
