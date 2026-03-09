import express from 'express';
import verifyToken from '../middlewares/auth.js';
import upload, { uploadFile } from '../middlewares/multer.js';
import {
    getContacts,
    getChatPartners,
    getMessages,
    sendMessage,
    markAsRead,
    searchMessages,
    deleteMessage,
    addReaction,
    removeReaction,
    getUnreadCounts,
} from '../controllers/message.controller.js';

const router = express.Router();

router.get('/contacts', verifyToken, getContacts);
router.get('/chat-partners', verifyToken, getChatPartners);
router.get('/unread-counts', verifyToken, getUnreadCounts);               // F6 unread counts
router.get('/search', verifyToken, searchMessages);                    // F5
router.get('/:partnerId', verifyToken, getMessages);                   // F3 (pagination via query)
router.post('/:partnerId', verifyToken, uploadFile.single("image"), sendMessage); // F6 (file support)
router.put('/:partnerId/read', verifyToken, markAsRead);               // F1
router.delete('/:msgId', verifyToken, deleteMessage);                  // F13
router.post('/:msgId/react', verifyToken, addReaction);                // F7
router.delete('/:msgId/react', verifyToken, removeReaction);           // F7

export default router;
