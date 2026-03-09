import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Group from '../models/group.model.js';
import UnreadCount from '../models/unreadCount.model.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, uploadFileToCloudinary } from '../services/cloudinary.service.js';
import { io, getReceiverSocketId } from '../socket/socket.js';
import { sendPushNotification } from '../services/push.service.js';

// ── Contacts & Chat Partners ──────────────────────────────────────

export const getContacts = async (req, res) => {
    try {
        const userId = req.id;
        const contacts = await User.find({ _id: { $ne: userId } }).select('-password');
        res.status(200).json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch contacts' });
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const userId = req.id;

        const partnerIds = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderID: new mongoose.Types.ObjectId(userId) },
                        { receiverID: new mongoose.Types.ObjectId(userId) },
                    ],
                    groupId: null, // only DM messages
                },
            },
            {
                $project: {
                    partnerId: {
                        $cond: {
                            if: { $eq: ['$senderID', new mongoose.Types.ObjectId(userId)] },
                            then: '$receiverID',
                            else: '$senderID',
                        },
                    },
                },
            },
            { $group: { _id: '$partnerId' } },
        ]);

        const chatPartners = await User.find({
            _id: { $in: partnerIds.map((p) => p._id) },
        }).select('-password');

        res.status(200).json(chatPartners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch chat partners' });
    }
};

// ── Messages (with cursor-based pagination — F3) ──────────────────

export const getMessages = async (req, res) => {
    try {
        const userId = req.id;
        const partnerId = req.params.partnerId;
        const { before, limit = 30 } = req.query;

        const query = {
            $or: [
                { senderID: userId, receiverID: partnerId },
                { senderID: partnerId, receiverID: userId },
            ],
            groupId: null,
        };

        // Cursor-based pagination: fetch messages before a given timestamp
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })         // newest first for limit
            .limit(parseInt(limit) + 1);      // fetch one extra to check hasMore

        const hasMore = messages.length > parseInt(limit);
        if (hasMore) messages.pop();

        // Return in chronological order
        messages.reverse();

        res.status(200).json({ messages, hasMore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch messages' });
    }
};

// ── Send Message (with file support — F6) ──────────────────────────

export const sendMessage = async (req, res) => {
    try {
        const userId = req.id;
        const partnerId = req.params.partnerId;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const { text } = req.body;
        let imageURL = null;
        let fileData = { url: null, name: null, type: null, size: null };

        if (req.file) {
            if (req.file.mimetype.startsWith('image/')) {
                imageURL = await uploadToCloudinary(req.file.buffer, 'chat-app/messages');
            } else {
                const uploaded = await uploadFileToCloudinary(
                    req.file.buffer,
                    req.file.originalname,
                    'chat-app/files'
                );
                fileData = {
                    url: uploaded.url,
                    name: uploaded.name,
                    type: req.file.mimetype,
                    size: uploaded.size,
                };
            }
        }

        const newMessage = new Message({
            senderID: userId,
            receiverID: partnerId,
            text: text || null,
            image: imageURL,
            file: fileData.url ? fileData : undefined,
            status: 'sent',
        });

        await newMessage.save();

        // Real-time delivery
        const receiverSocketId = getReceiverSocketId(partnerId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);

            // Mark as delivered since receiver is online
            newMessage.status = 'delivered';
            await newMessage.save();
            io.to(receiverSocketId).emit('messageStatusUpdate', {
                messageId: newMessage._id,
                status: 'delivered',
            });
        }

        // Push notification if receiver is offline (F8)
        if (!receiverSocketId) {
            const receiver = await User.findById(partnerId);
            if (receiver?.pushSubscription) {
                const sender = await User.findById(userId);
                sendPushNotification(receiver.pushSubscription, {
                    title: sender.fullname,
                    body: text || 'Sent an attachment',
                    icon: sender.profilePic || '/avatar.png',
                    url: '/',
                }).catch(() => { }); // fire and forget
            }
        }

        // Increment unread count for receiver
        await UnreadCount.findOneAndUpdate(
            { userId: partnerId, partnerId: userId, type: 'dm' },
            { $inc: { count: 1 } },
            { upsert: true }
        );

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not send message' });
    }
};

// ── Mark as Read (F1) ──────────────────────────────────────────────

export const markAsRead = async (req, res) => {
    try {
        const userId = req.id;
        const partnerId = req.params.partnerId;

        // Mark all unread messages from partner as read
        const result = await Message.updateMany(
            {
                senderID: partnerId,
                receiverID: userId,
                status: { $ne: 'read' },
            },
            { $set: { status: 'read' } }
        );

        // Notify the sender that their messages were read
        const senderSocketId = getReceiverSocketId(partnerId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', {
                readBy: userId,
                partnerId: partnerId,
            });
        }

        // Reset unread count
        await UnreadCount.findOneAndDelete({ userId, partnerId, type: 'dm' });

        res.status(200).json({ modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not mark messages as read' });
    }
};

// ── Search Messages (F5) ──────────────────────────────────────────

export const searchMessages = async (req, res) => {
    try {
        const userId = req.id;
        const { q, partnerId } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const query = {
            $text: { $search: q },
            isDeleted: false,
        };

        // If partnerId is specified, search only in that conversation
        if (partnerId) {
            query.$or = [
                { senderID: userId, receiverID: partnerId },
                { senderID: partnerId, receiverID: userId },
            ];
        } else {
            // Search in all conversations the user is part of
            query.$or = [
                { senderID: userId },
                { receiverID: userId },
            ];
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderID', 'fullname profilePic');

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Search failed' });
    }
};

// ── Delete Message (F13 — soft delete) ────────────────────────────

export const deleteMessage = async (req, res) => {
    try {
        const userId = req.id;
        const messageId = req.params.msgId;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.isDeleted) {
            return res.status(400).json({ message: 'Message is already deleted' });
        }

        // Only the sender can delete their own message
        if (message.senderID.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }

        message.isDeleted = true;
        message.text = null;
        message.image = null;
        message.file = { url: null, name: null, type: null, size: null };
        await message.save();

        // Notify in real-time
        if (message.groupId) {
            // Group message — broadcast to group room
            io.to(`group:${message.groupId}`).emit('groupMessageDeleted', { messageId });
        } else {
            const receiverId = message.receiverID?.toString();
            if (receiverId) {
                const receiverSocketId = getReceiverSocketId(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('messageDeleted', { messageId });
                }
            }
        }

        res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not delete message' });
    }
};

// ── Reactions (F7) ─────────────────────────────────────────────────

export const addReaction = async (req, res) => {
    try {
        const userId = req.id;
        const messageId = req.params.msgId;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ message: 'Emoji is required' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user has access to this message
        if (message.groupId) {
            const group = await Group.findById(message.groupId);
            if (!group || !group.members.map(m => m.toString()).includes(userId)) {
                return res.status(403).json({ message: 'You do not have access to this message' });
            }
        } else {
            const isSender = message.senderID.toString() === userId;
            const isReceiver = message.receiverID?.toString() === userId;
            if (!isSender && !isReceiver) {
                return res.status(403).json({ message: 'You do not have access to this message' });
            }
        }

        // Remove existing reaction from this user (toggle behavior)
        message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId
        );

        // Add new reaction
        message.reactions.push({ userId, emoji });
        await message.save();

        // Notify participants
        if (message.groupId) {
            io.to(`group:${message.groupId}`).emit('groupMessageReaction', {
                messageId,
                reactions: message.reactions,
            });
        } else {
            const otherUserId = message.senderID.toString() === userId
                ? message.receiverID?.toString()
                : message.senderID.toString();

            if (otherUserId) {
                const otherSocketId = getReceiverSocketId(otherUserId);
                if (otherSocketId) {
                    io.to(otherSocketId).emit('messageReaction', {
                        messageId,
                        reactions: message.reactions,
                    });
                }
            }
        }

        res.status(200).json({ reactions: message.reactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not add reaction' });
    }
};

export const removeReaction = async (req, res) => {
    try {
        const userId = req.id;
        const messageId = req.params.msgId;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId
        );
        await message.save();

        // Notify participants
        if (message.groupId) {
            io.to(`group:${message.groupId}`).emit('groupMessageReaction', {
                messageId,
                reactions: message.reactions,
            });
        } else {
            const otherUserId = message.senderID.toString() === userId
                ? message.receiverID?.toString()
                : message.senderID.toString();

            if (otherUserId) {
                const otherSocketId = getReceiverSocketId(otherUserId);
                if (otherSocketId) {
                    io.to(otherSocketId).emit('messageReaction', {
                        messageId,
                        reactions: message.reactions,
                    });
                }
            }
        }

        res.status(200).json({ reactions: message.reactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not remove reaction' });
    }
};

// ── Unread Counts ──────────────────────────────────────────────────

export const getUnreadCounts = async (req, res) => {
    try {
        const userId = req.id;
        const counts = await UnreadCount.find({ userId });

        const dm = {};
        const groups = {};

        for (const entry of counts) {
            if (entry.type === 'group') {
                groups[entry.partnerId.toString()] = entry.count;
            } else {
                dm[entry.partnerId.toString()] = entry.count;
            }
        }

        res.status(200).json({ dm, groups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch unread counts' });
    }
};
