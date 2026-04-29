import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from '../backend/config/db.js';
import logger from '../backend/utils/logger.js';
import globalErrorHandler from '../backend/middleware/errorMiddleware.js';

// Routes
import authRoutes from '../backend/routes/auth.js';
import projectRoutes from '../backend/routes/projects.js';
import userRoutes from '../backend/routes/users.js';
import aiRoutes from '../backend/routes/ai.js';
import messagesRoutes from '../backend/routes/messages.js';
import paymentRoutes from '../backend/routes/payments.js';
import certificateRoutes from '../backend/routes/certificates.js';
import reportRoutes from '../backend/routes/reports.js';
import reviewRoutes from '../backend/routes/reviewRoutes.js';
import invitationRoutes from '../backend/routes/invitationRoutes.js';
import notificationRoutes from '../backend/routes/notifications.js';
import uploadRoutes from '../backend/routes/uploadRoutes.js';
import publicRoutes from '../backend/routes/public.js';
import aiSmartRoutes from '../backend/routes/aiSmart.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://local-dev-platform.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// DB Connection Middleware (Serverless-compatible)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error('Database connection failed:', err);
    res.status(500).json({ message: 'Internal Server Error (DB)' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai-match', aiSmartRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LocalDev Connect API is running.' });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
