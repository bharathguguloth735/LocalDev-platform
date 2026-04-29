import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('CRITICAL: MONGO_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    isConnected = true;
    console.log(`[DB] Connected: ${mongoose.connection.host}`);
  } catch (err) {
    isConnected = false;
    console.error('[DB] Connection failed:', err.message);
    throw err;
  }
};

export default connectDB;
