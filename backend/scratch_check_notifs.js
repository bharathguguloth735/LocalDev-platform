import mongoose from 'mongoose';
import Notification from './models/Notification.js';

const check = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/localdev');
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent Notifications:', JSON.stringify(notifs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
