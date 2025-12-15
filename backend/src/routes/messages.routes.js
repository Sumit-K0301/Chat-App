import express from 'express';
import verifyToken from '../middlewares/auth.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middlewares/multer.js';

import {io, getReceiverSocketId} from "../socket/socket.js"

const router = express.Router();

router.get('/contacts', verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const contacts = await User.find({ _id: { $ne: userId } }).select('-password');

        res.status(200).json(contacts);
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch contacts' });
    }
});

router.get('/chat-partners', verifyToken, async (req, res) => {
    try {

        const userId = req.id;

        const partnerIds = new Set();
        
        const allMessages = await Message.find({
             $or: [ { senderID: userId }, { receiverID: userId } ]
        }).select('senderID receiverID -_id');

        allMessages.forEach(msg => {
            const otherId = msg.senderID.toString() === userId 
                ? msg.receiverID.toString() 
                : msg.senderID.toString();
            partnerIds.add(otherId);
        });

        const chatPartners = await User.find({ 
            _id: { $in: Array.from(partnerIds) } 
        }).select('-password');

        res.status(200).json(chatPartners);

    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch chat partners' });
    }
})

router.get('/:partnerId', verifyToken, async (req, res) => {
    try {
        const userId = req.id;
        const partnerId = req.params.partnerId;

        const messages = await Message.find({
            $or: [
                { senderID: userId, receiverID: partnerId },
                { senderID: partnerId, receiverID: userId }
            ]
        }).sort({ createdAt: 1 });  

        res.status(200).json(messages);
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch messages' });
    }
});

router.post('/:partnerId', verifyToken, upload.single("image"), async (req, res) => {
    try {
        const userId = req.id;
        const partnerId = req.params.partnerId;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const { text } = req.body; 
        let imageURL = null;

        // Check if a file was uploaded
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
        }

        const newMessage = new Message({
            senderID: userId,
            receiverID: partnerId,
            text: text || null,
            image: imageURL,
        });

        await newMessage.save();

        //Real Time Message
        const receiverSocketId = getReceiverSocketId(partnerId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not send message' });
    }
});



export default router;


