import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema, changePasswordSchema } from '../validators';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), authCtrl.signup);
router.post('/login', authRateLimiter, validate(loginSchema), authCtrl.login);
router.post('/logout', authCtrl.logout);
router.post('/refresh-token', authCtrl.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authCtrl.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authCtrl.resetPassword);
router.post('/verify-otp', validate(verifyOtpSchema), authCtrl.verifyOtp);
router.post('/resend-otp', validate(forgotPasswordSchema), authCtrl.resendOtp);
router.get('/me', authenticate, authCtrl.getMe);

export default router;
