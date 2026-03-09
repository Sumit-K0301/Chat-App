import User from '../models/user.model.js';

// ── Subscribe to Push ──────────────────────────────────────────────

export const subscribePush = async (req, res) => {
    try {
        const userId = req.id;
        const { subscription } = req.body;

        if (!subscription) {
            return res.status(400).json({ message: 'Subscription object is required' });
        }

        await User.findByIdAndUpdate(userId, { pushSubscription: subscription });

        res.status(200).json({ message: 'Push subscription saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not save push subscription' });
    }
};

// ── Unsubscribe from Push ──────────────────────────────────────────

export const unsubscribePush = async (req, res) => {
    try {
        const userId = req.id;
        await User.findByIdAndUpdate(userId, { pushSubscription: null });

        res.status(200).json({ message: 'Push subscription removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not remove push subscription' });
    }
};

// ── Get VAPID Public Key ───────────────────────────────────────────

export const getVapidPublicKey = (req, res) => {
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
};
