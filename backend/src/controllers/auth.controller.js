import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utilities/generateToken.js';
import getCookieOptions from '../config/cookie.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.cookie("authToken", generateToken(user._id), getCookieOptions());
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login unsuccessful' });
    }
};

export const logout = (req, res) => {
    const { maxAge, ...clearOptions } = getCookieOptions();
    res.clearCookie('authToken', clearOptions);
    res.status(200).json({ message: 'Logged out successfully' });
};

export const status = (req, res) => {
    res.status(200).json({ message: 'User is authenticated', userId: req.id });
};

// ── Forgot Password (F12) ─────────────────────────────────────────

export const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if email exists or not (security)
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        sendPasswordResetEmail(user.email, user.fullname, resetToken);

        res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not process password reset' });
    }
};

// ── Reset Password (F12) ──────────────────────────────────────────

export const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        user.password = password; // pre-save hook will hash it
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not reset password' });
    }
};
