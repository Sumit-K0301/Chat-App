import express from 'express';
import verifyToken from '../middlewares/auth.js';
import { getNicknames, setNickname, removeNickname } from '../controllers/nickname.controller.js';

const router = express.Router();

router.get('/', verifyToken, getNicknames);
router.put('/:targetId', verifyToken, setNickname);
router.delete('/:targetId', verifyToken, removeNickname);

export default router;
