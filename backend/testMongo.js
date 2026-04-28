import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const dbPath = path.join(__dirname, 'db_data');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbPath: dbPath,
    }
  });

  console.log(`Connected with persistence at ${dbPath}`);
  console.log(`URI:`, mongod.getUri());
  await mongod.stop();
};

run().catch(console.error);
