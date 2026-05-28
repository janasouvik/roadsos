import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser);

router.get('/nearby', serviceController.getNearby);
router.get('/hospitals', serviceController.getHospitals);
router.get('/ambulances', serviceController.getAmbulances);
router.get('/police', serviceController.getPolice);
router.get('/towing', serviceController.getTowing);

export default router;
