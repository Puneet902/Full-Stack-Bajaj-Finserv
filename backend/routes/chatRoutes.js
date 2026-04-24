import express from 'express';
import { handleChatPost } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChatPost);

export default router;
