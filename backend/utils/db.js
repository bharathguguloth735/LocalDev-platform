import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db.json');

// Initialize the database file if it doesn't exist
const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], projects: [], messages: [] }, null, 2));
  } else {
    // Migrate existing DB if needed
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!data.messages) {
      data.messages = [];
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
  }
};
initDB();

export const getDB = () => {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return { users: [], projects: [], messages: [] };
  }
};

export const saveDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};
