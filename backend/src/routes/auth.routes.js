import express from 'express';
import { check } from 'express-validator';
import { login, logout, status, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { verifyEmail, resendVerification } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please include a valid password').isLength({ min: 6 }),
    ],
    login
);

router.post('/logout', logout);

router.get('/status', verifyToken, status);

// F11: Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', verifyToken, resendVerification);

// F12: Forgot / Reset password
router.post('/forgot-password',
    [check('email', 'Please include a valid email').isEmail()],
    forgotPassword
);

router.post('/reset-password/:token',
    [check('password', 'Password must be at least 6 characters').isLength({ min: 6 })],
    resetPassword
);

export default router;