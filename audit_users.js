import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import mongoose from 'mongoose';
import dns from 'dns';
import User from './backend/models/User.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function auditUsers() {
    const mongoUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoUri);
        const emailSearch = 'bharathguguloth735@gmail.com';
        const users = await User.find({ email: new RegExp(emailSearch, 'i') });
        
        console.log(`\n🔎 AUDIT RESULTS for ${emailSearch}:`);
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach((u, i) => {
                console.log(`[${i+1}] ID: ${u._id} | Name: ${u.name} | Role: ${u.role} | Onboarded: ${u.onboarded}`);
            });
        }
        console.log('\n');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

auditUsers();
