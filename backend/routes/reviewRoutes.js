import express from 'express';
import Review from '../models/Review.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getIO } from '../socketService.js';

const router = express.Router();

// @desc    Submit a review for a project
// @route   POST /api/reviews
router.post('/', verifyToken, async (req, res) => {
  const { projectId, rating, comment } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.developer) {
      return res.status(400).json({ message: 'No developer assigned to this project' });
    }

    const currentUserId = req.user.id || req.user._id;
    const review = new Review({
      project: projectId,
      client: currentUserId,
      developer: project.developer,
      rating,
      comment
    });

    const savedReview = await review.save();

    // Lock Project Review Status
    project.status = 'completed';
    project.isReviewed = true;
    await project.save();

    res.status(201).json(savedReview);

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const notif = new Notification({
        recipient: project.developer,
        sender: currentUserId,
        type: 'review',
        title: 'New Performance Audit Received',
        message: `Client ${req.user.name || 'Partner'} has posted a review for your work.`,
        link: '/student-dashboard/reviews'
      });
      await notif.save();
      getIO().to(project.developer.toString()).emit('notification:new', notif);
    } catch (err) { console.error('Notif failed:', err); }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get reviews for a developer
// @route   GET /api/reviews/developer/:id
router.get('/developer/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ developer: req.params.id })
      .populate('client', 'name profile')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
