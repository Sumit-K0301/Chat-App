import express from 'express';
import verifyToken from '../middlewares/auth.js';
import { search } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', verifyToken, search);

export default router;
