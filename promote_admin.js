import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import mongoose from 'mongoose';
import dns from 'dns';
import User from './backend/models/User.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function promoteToAdmin() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        const email = 'bharathguguloth735@gmail.com';
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`\n✅ SUCCESS: ${user.name} has been promoted to Master Admin.`);
            console.log(`Current Role: ${user.role}\n`);
        } else {
            console.log(`\n❌ ERROR: User with email ${email} not found in database.\n`);
        }
    } catch (err) {
        console.error('Promotion failed:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

promoteToAdmin();
