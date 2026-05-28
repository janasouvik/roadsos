import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser);

// SOS requests route is accessible to all admin types (ADMIN, SUPER_ADMIN, POLICE, HOSPITAL)
router.get('/sos-requests', authorizeRoles('ADMIN', 'SUPER_ADMIN', 'POLICE', 'HOSPITAL'), adminController.getSosRequests);
router.patch('/sos-requests/:id/status', authorizeRoles('ADMIN', 'SUPER_ADMIN', 'POLICE', 'HOSPITAL'), adminController.updateSosStatus);

// GET users and POST trigger-sos are also accessible to all admin types (ADMIN, SUPER_ADMIN, POLICE, HOSPITAL)
router.get('/users', authorizeRoles('ADMIN', 'SUPER_ADMIN', 'POLICE', 'HOSPITAL'), adminController.getUsers);
router.post('/trigger-sos/:userId', authorizeRoles('ADMIN', 'SUPER_ADMIN', 'POLICE', 'HOSPITAL'), adminController.triggerSosForUser);

// Rest of the admin routes are restricted to ADMIN and SUPER_ADMIN
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'));

router.patch('/block-user/:id', adminController.blockUser);
router.patch('/unblock-user/:id', adminController.unblockUser);
router.delete('/delete-user/:id', authorizeRoles('SUPER_ADMIN'), adminController.deleteUser);
router.get('/analytics', adminController.getAnalytics);

export default router;
