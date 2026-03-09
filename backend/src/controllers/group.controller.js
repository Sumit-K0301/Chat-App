import Group from '../models/group.model.js';
import Message from '../models/message.model.js';
import UnreadCount from '../models/unreadCount.model.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, uploadFileToCloudinary } from '../services/cloudinary.service.js';
import { io, getReceiverSocketId } from '../socket/socket.js';

// ── Create Group ───────────────────────────────────────────────────

export const createGroup = async (req, res) => {
    try {
        const userId = req.id;
        const { name, description, members } = req.body;

        if (!name || !members || members.length < 1) {
            return res.status(400).json({ message: 'Group name and at least 1 member are required' });
        }

        // Ensure creator is included in members and admins
        const allMembers = [...new Set([userId, ...members])];

        const group = new Group({
            name,
            description: description || '',
            members: allMembers,
            admins: [userId],
            createdBy: userId,
        });

        if (req.file) {
            group.groupPic = await uploadToCloudinary(req.file.buffer, 'chat-app/groups');
        }

        await group.save();

        const populated = await Group.findById(group._id)
            .populate('members', 'fullname profilePic bio')
            .populate('admins', 'fullname profilePic')
            .populate('createdBy', 'fullname profilePic bio');

        // Notify all members in real-time (only group members, not everyone)
        allMembers.forEach((memberId) => {
            const memberStr = memberId.toString();
            const socketId = getReceiverSocketId(memberStr);
            if (socketId) {
                io.to(socketId).emit('groupCreated', populated);
            }
        });

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not create group' });
    }
};

// ── Get User's Groups ──────────────────────────────────────────────

export const getGroups = async (req, res) => {
    try {
        const userId = req.id;

        const groups = await Group.find({ members: userId })
            .populate('members', 'fullname profilePic bio')
            .populate('admins', 'fullname profilePic')
            .populate('createdBy', 'fullname profilePic bio')
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch groups' });
    }
};

// ── Get Group Messages ─────────────────────────────────────────────

export const getGroupMessages = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;
        const { before, limit = 30 } = req.query;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.members.map(m => m.toString()).includes(userId)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const query = { groupId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) + 1)
            .populate('senderID', 'fullname profilePic');

        const hasMore = messages.length > parseInt(limit);
        if (hasMore) messages.pop();

        messages.reverse();

        res.status(200).json({ messages, hasMore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch group messages' });
    }
};

// ── Send Group Message ─────────────────────────────────────────────

export const sendGroupMessage = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;
        const { text } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.map(m => m.toString()).includes(userId)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        let imageURL = null;
        let fileData = { url: null, name: null, type: null, size: null };

        if (req.file) {
            if (req.file.mimetype.startsWith('image/')) {
                imageURL = await uploadToCloudinary(req.file.buffer, 'chat-app/group-messages');
            } else {
                const uploaded = await uploadFileToCloudinary(
                    req.file.buffer,
                    req.file.originalname,
                    'chat-app/group-files'
                );
                fileData = { url: uploaded.url, name: uploaded.name, type: req.file.mimetype, size: uploaded.size };
            }
        }

        const newMessage = new Message({
            senderID: userId,
            groupId,
            text: text || null,
            image: imageURL,
            file: fileData.url ? fileData : undefined,
            status: 'sent',
        });

        await newMessage.save();

        const populated = await Message.findById(newMessage._id)
            .populate('senderID', 'fullname profilePic');

        // Broadcast to the group room
        io.to(`group:${groupId}`).emit('newGroupMessage', populated);

        // Increment unread count for all group members except sender
        const unreadOps = group.members
            .filter((m) => m.toString() !== userId)
            .map((memberId) =>
                UnreadCount.findOneAndUpdate(
                    { userId: memberId, partnerId: groupId, type: 'group' },
                    { $inc: { count: 1 } },
                    { upsert: true }
                )
            );
        await Promise.all(unreadOps);

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not send group message' });
    }
};

// ── Add Member ─────────────────────────────────────────────────────

export const addMember = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;
        const { memberId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.admins.map(a => a.toString()).includes(userId)) {
            return res.status(403).json({ message: 'Only admins can add members' });
        }

        if (group.members.map(m => m.toString()).includes(memberId)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(memberId);
        await group.save();

        const populated = await Group.findById(groupId)
            .populate('members', 'fullname profilePic bio')
            .populate('admins', 'fullname profilePic')
            .populate('createdBy', 'fullname profilePic bio');

        io.to(`group:${groupId}`).emit('groupUpdated', populated);

        res.status(200).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not add member' });
    }
};

// ── Remove Member ──────────────────────────────────────────────────

export const removeMember = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;
        const { memberId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.admins.map(a => a.toString()).includes(userId)) {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        if (!group.members.map(m => m.toString()).includes(memberId)) {
            return res.status(400).json({ message: 'User is not a member of this group' });
        }

        group.members = group.members.filter(m => m.toString() !== memberId);
        group.admins = group.admins.filter(a => a.toString() !== memberId);
        await group.save();

        const populated = await Group.findById(groupId)
            .populate('members', 'fullname profilePic bio')
            .populate('admins', 'fullname profilePic')
            .populate('createdBy', 'fullname profilePic bio');

        io.to(`group:${groupId}`).emit('groupUpdated', populated);

        res.status(200).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not remove member' });
    }
};

// ── Mark Group as Read ─────────────────────────────────────────────

export const markGroupAsRead = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;

        await UnreadCount.findOneAndDelete({ userId, partnerId: groupId, type: 'group' });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not mark group as read' });
    }
};

// ── Update Group ───────────────────────────────────────────────────

export const updateGroup = async (req, res) => {
    try {
        const userId = req.id;
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.admins.map(a => a.toString()).includes(userId)) {
            return res.status(403).json({ message: 'Only admins can update the group' });
        }

        if (req.body.name) group.name = req.body.name;
        if (req.body.description !== undefined) group.description = req.body.description;

        if (req.file) {
            group.groupPic = await uploadToCloudinary(req.file.buffer, 'chat-app/groups');
        }

        await group.save();

        const populated = await Group.findById(groupId)
            .populate('members', 'fullname profilePic bio')
            .populate('admins', 'fullname profilePic')
            .populate('createdBy', 'fullname profilePic bio');

        io.to(`group:${groupId}`).emit('groupUpdated', populated);

        res.status(200).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not update group' });
    }
};
