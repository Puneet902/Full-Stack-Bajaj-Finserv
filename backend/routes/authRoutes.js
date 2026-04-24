import express from 'express';
import { handleLogin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', verifyToken, handleLogin);

export default router;
