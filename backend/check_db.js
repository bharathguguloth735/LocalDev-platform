import 'dotenv/config';
import mongoose from 'mongoose';
import Notification from './models/Notification.js';

const MONGO_URI = process.env.MONGO_URI;

async function check() {
  if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not defined in .env');
    return;
  }

  try {
    console.log('⏳ Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully to Atlas!');
    const count = await Notification.countDocuments();
    const latest = await Notification.find().sort({ createdAt: -1 }).limit(5);
    console.log('--- NOTIFICATION CHECK ---');
    console.log('Total Count:', count);
    console.log('Latest 5:', JSON.stringify(latest, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Check failed:', err);
  }
}

check();
