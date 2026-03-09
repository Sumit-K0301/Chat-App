import express from 'express';
import verifyToken from '../middlewares/auth.js';
import { subscribePush, unsubscribePush, getVapidPublicKey } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', verifyToken, subscribePush);
router.post('/unsubscribe', verifyToken, unsubscribePush);

export default router;
