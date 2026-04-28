import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get public portfolio by username
router.get('/portfolio/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -wallet_balance -onboarded -email'); // Security: Never send sensitive info

    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found.' });
    }

    // Also fetch their public reviews
    const reviews = await Review.find({ student: user._id })
      .populate('client', 'name profile.avatar')
      .sort({ createdAt: -1 });

    // Fetch some successful projects they've worked on
    const projects = await Project.find({ 
      student: user._id, 
      status: 'completed' 
    }).limit(5);

    res.status(200).json({
      user,
      reviews,
      projects
    });
  } catch (error) {
    logger.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
