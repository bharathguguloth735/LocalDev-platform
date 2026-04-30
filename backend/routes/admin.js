import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import SessionLog from '../models/SessionLog.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET PLATFORM STATISTICS ─────────────────────────────────────────────
router.get('/stats', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const clients = await User.countDocuments({ role: 'client' });
    const admins = await User.countDocuments({ role: 'admin' });
    const totalProjects = await Project.countDocuments();
    
    // Calculate Online Users (active in last 5 mins)
    const onlineUsers = await SessionLog.distinct('user', {
      lastActive: { $gte: new Date(Date.now() - 5 * 60000) }
    });
    
    // Latest Activities for Protocol Stream
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name createdAt');
    const latestProjects = await Project.find().populate('client', 'name').sort({ createdAt: -1 }).limit(5).select('title client createdAt');
    
    const activities = [
      ...latestUsers.map(u => ({
        actor: u.name,
        action: 'Identity Protocol Registered',
        time: u.createdAt,
        type: 'user'
      })),
      ...latestProjects.map(p => ({
        actor: p.client?.name || 'Enterprise Entity',
        action: `Venture Initialized: ${p.title}`,
        time: p.createdAt,
        type: 'project'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json({
      totalUsers,
      students,
      clients,
      admins,
      totalProjects,
      onlineUsers: onlineUsers.length,
      offlineUsers: Math.max(0, totalUsers - onlineUsers.length),
      activities
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch platform statistics' });
  }
});

export default router;
