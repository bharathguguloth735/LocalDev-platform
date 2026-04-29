import mongoose from 'mongoose';
import logger from '../utils/logger.js';
let mongod = null;

const connectDB = async () => {
  // If already connected, don't reconnect
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      logger.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    logger.info('📡 Attempting to connect to MongoDB Atlas...');
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MONGO_URI is missing from environment variables!');
    }

    // Mask URI for logs (e.g. mongodb+srv://L...***@...)
    const maskedUri = uri.replace(/:([^@]+)@/, ':***@');
    logger.info(`🔗 Using URI: ${maskedUri}`);

    // Try to connect to the provided URI
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Fail fast if IP is blocked
        connectTimeoutMS: 10000,
      });
      logger.info(`[LocalDev Connect] Mission Database Connected: ${conn.connection.host}`);
    } catch (err) {
      if (err.name === 'MongooseServerSelectionError' || err.message.includes('whitelist')) {
        let currentIp = 'Unknown';
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          currentIp = data.ip;
        } catch (ipErr) {
          logger.warn('Could not fetch public IP for whitelisting advice.');
        }

        logger.error('--- MONGODB CONNECTION FAILED ---');
        logger.error('Reason: Could not connect to Atlas. This is likely an IP Whitelist issue.');
        logger.error(`Your current IP: ${currentIp}`);
        logger.error('Please add this IP to your Atlas Whitelist: https://cloud.mongodb.com/');
        logger.error('Path: Network Access -> + Add IP Address');
        
        if (process.env.NODE_ENV !== 'production') {
          if (!mongod) {
            logger.info('🚀 Starting In-Memory MongoDB Fallback for development...');
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            logger.info('✅ [LocalDev Connect] Fallback: Connected to In-Memory Database');
            logger.info('⚠️  Note: Data will NOT be persisted across server restarts in this mode.');
          } else {
            logger.info('[LocalDev Connect] Fallback: Already connected to In-Memory Database');
          }
          return;
        }
      }
      throw err;
    }
  } catch (err) {
    logger.error(`Failed to connect to database: ${err.message}`);
    throw err;
  }
};

export default connectDB;
