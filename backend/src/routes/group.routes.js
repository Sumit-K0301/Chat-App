import express from 'express';
import verifyToken from '../middlewares/auth.js';
import upload, { uploadFile } from '../middlewares/multer.js';
import {
    createGroup,
    getGroups,
    getGroupMessages,
    sendGroupMessage,
    addMember,
    removeMember,
    markGroupAsRead,
    updateGroup,
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', verifyToken, upload.single('groupPic'), createGroup);
router.get('/', verifyToken, getGroups);
router.get('/:groupId/messages', verifyToken, getGroupMessages);
router.post('/:groupId/messages', verifyToken, uploadFile.single('image'), sendGroupMessage);
router.post('/:groupId/members', verifyToken, addMember);
router.delete('/:groupId/members', verifyToken, removeMember);
router.put('/:groupId/read', verifyToken, markGroupAsRead);
router.put('/:groupId', verifyToken, upload.single('groupPic'), updateGroup);

export default router;
