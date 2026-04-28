import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Models
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportData = async () => {
  try {
    const dbPath = path.join(__dirname, 'db_data_fresh');
    const mongod = await MongoMemoryServer.create({
      instance: { dbPath: dbPath, storageEngine: 'wiredTiger' }
    });
    
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("Securely Uplinked to Local Persistence Node.");

    const users = await User.find({});
    const projects = await Project.find({});
    const payments = await Payment.find({});

    const snapshot = {
      timestamp: new Date().toISOString(),
      authorized_downloader: "System Archive",
      payload: {
        users: users.length,
        projects: projects.length,
        payments: payments.length
      },
      data: { users, projects, payments }
    };

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    
    const filePath = path.join(backupDir, `DB_Snapshot_V4_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));

    console.log(`Database Securely Archived to: ${filePath}`);
    process.exit(0);
  } catch (err) {
    console.error("Critical Archival Error:", err);
    process.exit(1);
  }
};

exportData();
