import express from 'express';
import { check, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import generateToken from '../utilities/generateToken.js';
import sendEmail from '../utilities/sendEmail.js';
import verifyToken from '../middlewares/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post('/register',
    [
        check('fullname', 'Fullname is required').isString(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const newUser = new User({
                fullname: req.body.fullname,
                email: req.body.email,
                password: req.body.password,
            });

            await newUser.save();
            
            res.cookie("authToken", generateToken(newUser._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                // sameSite: 'true',
                maxAge: 24 * 60 * 60 * 1000,
            });

            sendEmail(newUser.email, newUser.fullname);

            res.status(201).json({ message: 'User registered successfully' });
        }

        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'User not registered' });
        }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

router.put('/update-profile',
    verifyToken,
    upload.single("profilePic"),
    [
        check('fullname', 'Fullname is required').optional().isString(),
        check('email', 'Please include a valid email').optional().isEmail(),
        check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.id);  
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if(req.body.email) {
                const userExists = await User.findOne({email: req.body.email})
                if(userExists && userExists._id.toString() !== req.id) {
                    return res.status(400).json({message: 'Email already in use by another account'})
                }

                user.email = req.body.email;
            }

            
            if(req.body.fullname) user.fullname = req.body.fullname;
            if(req.body.password) user.password = req.body.password;

            let imageURL = null;

            if (req.file) {
                
              // This promise wrapper allows us to upload the buffer directly
                const uploadResult = await new Promise((resolve, reject) => {
                
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                    // Pipe the buffer into Cloudinary
                    stream.end(req.file.buffer);
                });

                imageURL = uploadResult.secure_url;
                user.profilePic = imageURL
            }
            
            const updatedUser = await user.save();

            res.status(200).json({updatedUser});
        }

        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating profile' });
        }
});

export default router;