import User from '../models/user.model.js';
import Group from '../models/group.model.js';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';

// Escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const search = async (req, res) => {
    try {
        const userId = req.id;
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const trimmed = q.trim().slice(0, 100);
        const safeQuery = escapeRegex(trimmed);
        const regex = { $regex: safeQuery, $options: 'i' };

        // Search users by fullname and email
        const users = await User.find({
            _id: { $ne: userId },
            $or: [{ fullname: regex }, { email: regex }],
        })
            .select('fullname profilePic email bio')
            .limit(10);

        // Search groups the user is a member of
        const groups = await Group.find({
            members: userId,
            $or: [{ name: regex }, { description: regex }],
        })
            .populate('members', 'fullname profilePic bio')
            .limit(10);

        // Search messages in user's conversations and groups
        const userGroups = await Group.find({ members: userId }).select('_id');
        const groupIds = userGroups.map((g) => g._id);

        const messages = await Message.find({
            isDeleted: false,
            text: regex,
            $or: [
                { senderID: userId, groupId: null },
                { receiverID: userId, groupId: null },
                { groupId: { $in: groupIds } },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('senderID', 'fullname profilePic');

        res.status(200).json({ users, groups, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Search failed' });
    }
};
