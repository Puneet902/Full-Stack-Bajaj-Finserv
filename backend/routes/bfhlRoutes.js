import express from 'express';
import { handleBfhlPost, handleBfhlHistory } from '../controllers/bfhlController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, handleBfhlPost);
router.get('/history', handleBfhlHistory);

export default router;
