import ContactNickname from '../models/contactNickname.model.js';
import mongoose from 'mongoose';

// ── Get All Nicknames ──────────────────────────────────────────────

export const getNicknames = async (req, res) => {
    try {
        const nicknames = await ContactNickname.find({ ownerId: req.id })
            .select('targetId nickname -_id');
        res.status(200).json(nicknames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch nicknames' });
    }
};

// ── Set/Update Nickname ────────────────────────────────────────────

export const setNickname = async (req, res) => {
    try {
        const { targetId } = req.params;
        const { nickname } = req.body;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
            return res.status(400).json({ message: 'Nickname is required' });
        }

        if (nickname.length > 50) {
            return res.status(400).json({ message: 'Nickname must be at most 50 characters' });
        }

        await ContactNickname.findOneAndUpdate(
            { ownerId: req.id, targetId },
            { nickname: nickname.trim() },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not set nickname' });
    }
};

// ── Remove Nickname ────────────────────────────────────────────────

export const removeNickname = async (req, res) => {
    try {
        const { targetId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        await ContactNickname.findOneAndDelete({
            ownerId: req.id,
            targetId,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not remove nickname' });
    }
};
