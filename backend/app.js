import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bfhlRoutes from './routes/bfhlRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/bfhl', bfhlRoutes);
app.use('/chat', chatRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
