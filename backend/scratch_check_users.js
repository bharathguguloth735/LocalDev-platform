import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  // Use the standard URI if the server is running on port 5000 (usually mapped to 27017 or similar)
  // But wait, if it's a memory server, we need the EXACT URI from the running process.
  // Since we can't easily get that, let's try to connect to the default MongoMemoryServer port if known.
  
  const MONGODB_URI = "mongodb://127.0.0.1:5000/localdev"; // Adjust if main server is on different port
  
  console.log("Attempting to connect to Mission Database...");
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    // Use existing User model pattern
    const userSchema = new mongoose.Schema({ 
        name: String, 
        email: String, 
        role: String 
    });
    
    // Check if model exists to prevent OverwriteModelError
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const clients = await User.find({ role: 'client' });
    console.log("\n── REGISTERED CLIENTS ──────────────────");
    if (clients.length === 0) {
      console.log("No clients found in current sector.");
    } else {
      clients.forEach(u => {
        console.log(`> ${u.name.padEnd(20)} | ${u.email}`);
      });
    }
    console.log("────────────────────────────────────────\n");
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("ERROR: Could not connect to the live database node.");
    console.error("Make sure your main server (npm run dev) is active.");
  }
};

run();
