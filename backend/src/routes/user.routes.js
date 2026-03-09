import express from 'express';
import { check } from 'express-validator';
import { register, getProfile, updateProfile } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post('/register',
    [
        check('fullname', 'Fullname is required').isString(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    register
);

router.get('/profile', verifyToken, getProfile);

router.put('/update-profile',
    verifyToken,
    upload.single("profilePic"),
    [
        check('fullname', 'Fullname is required').optional().isString(),
        check('email', 'Please include a valid email').optional().isEmail(),
        check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
    ],
    updateProfile
);

export default router;