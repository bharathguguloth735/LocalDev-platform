import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import SessionLog from '../models/SessionLog.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET PLATFORM STATISTICS ─────────────────────────────────────────────
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const clients = await User.countDocuments({ role: 'client' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    const totalProjects = await Project.countDocuments();
    
    // Online logic: No logoutTime and updated in the last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsersCount = await SessionLog.distinct('user', {
      logoutTime: { $exists: false },
      updatedAt: { $gte: fifteenMinsAgo }
    });

    res.json({
      totalUsers,
      students,
      clients,
      admins,
      totalProjects,
      onlineUsers: onlineUsersCount.length,
      offlineUsers: totalUsers - onlineUsersCount.length
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch platform statistics' });
  }
});

export default router;
