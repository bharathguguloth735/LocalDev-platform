import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/localbuisness';

async function reset() {
  try {
    console.log('--- SYSTEM WIPE INITIATED ---');
    
    // Connect to external or memory DB
    // Note: If using MongoMemoryServer with dbPath, I'll delete the folder too
    const dbPath = path.join(__dirname, 'db_data_fresh');
    
    await mongoose.connect(MONGO_URI);
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      console.log(`Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }
    
    await mongoose.disconnect();
    
    if (fs.existsSync(dbPath)) {
      console.log('Cleaning local sector data storage...');
      // Note: fs.rmSync in modern Node
      fs.rmSync(dbPath, { recursive: true, force: true });
    }

    console.log('--- MISSION RESET COMPLETE: PLATFORM IS NOW NEW ---');
  } catch (err) {
    console.error('Reset failed:', err);
  }
}

reset();
