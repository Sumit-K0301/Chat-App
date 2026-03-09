import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/user.model.js';
import generateToken from '../utilities/generateToken.js';
import { sendWelcomeEmail, sendVerificationEmail } from '../services/email.service.js';
import getCookieOptions from '../config/cookie.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';

// ── Register ───────────────────────────────────────────────────────

export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate verification token (F11)
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            verificationToken,
            verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        await newUser.save();

        res.cookie("authToken", generateToken(newUser._id), getCookieOptions());
        sendWelcomeEmail(newUser.email, newUser.fullname);
        sendVerificationEmail(newUser.email, newUser.fullname, verificationToken);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'User not registered' });
    }
};

// ── Get Profile ────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

// ── Update Profile (with bio — F9) ────────────────────────────────

export const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.email) {
            const userExists = await User.findOne({ email: req.body.email });
            if (userExists && userExists._id.toString() !== req.id) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = req.body.email;
        }

        if (req.body.fullname) user.fullname = req.body.fullname;
        if (req.body.password) user.password = req.body.password;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        if (req.body.theme) user.theme = req.body.theme;

        if (req.file) {
            user.profilePic = await uploadToCloudinary(req.file.buffer, 'chat-app/profiles');
        }

        const updatedUser = await user.save();

        // Exclude password from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({ updatedUser: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// ── Verify Email (F11) ─────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Email verification failed' });
    }
};

// ── Resend Verification Email (F11) ────────────────────────────────

export const resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        sendVerificationEmail(user.email, user.fullname, verificationToken);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not resend verification email' });
    }
};
