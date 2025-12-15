import express from 'express';
import { check, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utilities/generateToken.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please include a valid password').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }   

        try {

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            res.cookie("authToken", generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                // sameSite: 'true',
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.status(200).json({ message: 'Logged in successfully' });
        }

        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Login unsuccessful' });
        }
});

router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'true',
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/status', verifyToken, (req, res) => {
    res.status(200).json({ message: 'User is authenticated', userId: req.id });
})

export default router;