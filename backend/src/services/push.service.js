import webPush from 'web-push';

// VAPID keys should be set in .env
// Generate with: npx web-push generate-vapid-keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        `mailto:${process.env.SENDGRID_FROM_EMAIL}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Send a push notification to a user's subscription.
 * @param {Object} subscription - The push subscription object.
 * @param {Object} payload - { title, body, icon, url }
 */
export const sendPushNotification = async (subscription, payload) => {
    if (!subscription || !process.env.VAPID_PUBLIC_KEY) return;

    try {
        await webPush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
    } catch (error) {
        console.error('Push notification failed:', error.message);
        // If subscription is expired/invalid, it will throw — caller should handle cleanup
        if (error.statusCode === 410) {
            throw new Error('SUBSCRIPTION_EXPIRED');
        }
    }
};

export default sendPushNotification;
