import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../validators/user.validator';
import { avatarUpload } from '../middlewares/upload.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticateUser);

router.get('/profile', userController.getProfile);
router.patch('/profile', avatarUpload, validate(updateProfileSchema), userController.updateProfile);
router.delete('/delete-account', userController.deleteAccount);

export default router;
