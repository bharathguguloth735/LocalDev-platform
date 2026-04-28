import 'dotenv/config'; // Port cleared?
import express from 'express';
import { createServer } from 'http';
import { initSocket } from './socketService.js';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import messagesRoutes from './routes/messages.js';
import paymentRoutes from './routes/payments.js';
import certificateRoutes from './routes/certificates.js';
import reportRoutes from './routes/reports.js';
import reviewRoutes from './routes/reviewRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/uploadRoutes.js';
import publicRoutes from './routes/public.js';
import aiSmartRoutes from './routes/aiSmart.js';
import { apiLimiter, authLimiter, aiLimiter, uploadLimiter } from './middleware/rateLimitMiddleware.js';

import connectDB from './config/db.js';
import globalErrorHandler from './middleware/errorMiddleware.js';
import AppError from './utils/AppError.js';
import logger from './utils/logger.js';

const app = express();
export { app }; // Export for testing
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB Connection (Required for Serverless/Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error('Database connection failed in middleware:', err);
    res.status(500).json({ message: 'Internal Server Error (DB)' });
  }
});

// Routes
const isTest = process.env.NODE_ENV === 'test';

app.use('/api/auth', isTest ? authRoutes : [authLimiter, authRoutes]);
app.use('/api/projects', isTest ? projectRoutes : [apiLimiter, projectRoutes]);
app.use('/api/users', isTest ? userRoutes : [apiLimiter, userRoutes]);
app.use('/api/ai', isTest ? aiRoutes : [aiLimiter, aiRoutes]);
app.use('/api/messages', isTest ? messagesRoutes : [apiLimiter, messagesRoutes]);
app.use('/api/payments', isTest ? paymentRoutes : [apiLimiter, paymentRoutes]);
app.use('/api/certificates', isTest ? certificateRoutes : [apiLimiter, certificateRoutes]);
app.use('/api/reports', isTest ? reportRoutes : [apiLimiter, reportRoutes]);
app.use('/api/reviews', isTest ? reviewRoutes : [apiLimiter, reviewRoutes]);
app.use('/api/invitations', isTest ? invitationRoutes : [apiLimiter, invitationRoutes]);
app.use('/api/notifications', isTest ? notificationRoutes : [apiLimiter, notificationRoutes]);
app.use('/api/upload', isTest ? uploadRoutes : [uploadLimiter, uploadRoutes]);
app.use('/api/public', publicRoutes);
app.use('/api/ai-match', aiSmartRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LocalDev Connect API is running.' });
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(frontendPath, 'index.html'));
      }
    });
    logger.info('🚀 Serving Frontend Production Build');
  } else {
    logger.warn('⚠️ Frontend dist folder not found. Run "npm run build" in frontend.');
  }
}

const startServer = async () => {
  try {
    await connectDB();

    let retries = 0;
    const MAX_RETRIES = 5;

    httpServer.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        retries++;
        if (retries >= MAX_RETRIES) {
          logger.error(`Port ${PORT} still in use after ${MAX_RETRIES} attempts. Exiting so nodemon can restart...`);
          process.exit(1);
        }
        logger.error(`Port ${PORT} is already in use. Retrying in 1s... (${retries}/${MAX_RETRIES})`);
        setTimeout(() => {
          httpServer.close();
          httpServer.listen(PORT);
        }, 1000);
      }
    });

    httpServer.listen(PORT, () => {
      logger.info(`[LocalDev Connect] Server + WebSocket running on port ${PORT}`);
    });

  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default app;

 
