import mongoose from 'mongoose';
import Notification from './models/Notification.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/localbuisness';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
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
