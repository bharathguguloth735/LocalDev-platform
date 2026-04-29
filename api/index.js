// Vercel Serverless Function Bridge
export default async (req, res) => {
  try {
    // 1. Ensure DB connection
    const { default: connectDB } = await import('../backend/config/db.js');
    await connectDB();

    // 2. Load the main app
    // We use dynamic import to catch top-level errors in backend/index.js
    const { default: app } = await import('../backend/index.js');

    // 3. Handle request
    return app(req, res);
  } catch (err) {
    console.error('VERCEL_RUNTIME_ERROR:', err);
    
    // Return a structured error so we can see it in the browser/logs
    res.status(500).json({ 
      error: 'Function Invocation Failed', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      hint: 'Check Vercel Environment Variables and ensure all dependencies are installed.'
    });
  }
};
