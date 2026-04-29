import app from '../backend/index.js';
import connectDB from '../backend/config/db.js';

// Vercel Serverless Function Bridge
export default async (req, res) => {
  // Ensure DB connection for serverless cold starts
  try {
    await connectDB();
    // Use the Express app to handle the request
    return app(req, res);
  } catch (err) {
    console.error('Vercel API Error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
