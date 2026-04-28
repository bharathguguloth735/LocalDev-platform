import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Project from '../models/Project.js';

const router = express.Router();

// Get only engaged users (contacts who share a project)
router.get('/', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    
    // Find all projects where the user is either the client or the developer
    const projects = await Project.find({
      $or: [{ client: currentUserId }, { developer: currentUserId }]
    });

    // Extract the "other" person's ID from each project
    const engagedUserIds = new Set();
    projects.forEach(p => {
      if (p.client && p.client.toString() !== currentUserId.toString()) engagedUserIds.add(p.client.toString());
      if (p.developer && p.developer.toString() !== currentUserId.toString()) engagedUserIds.add(p.developer.toString());
    });

    // Fetch users based on these IDs
    const engagedUsers = await User.find({ 
      _id: { $in: Array.from(engagedUserIds) } 
    }).select('-password');
    
    // Enrich users with unread counts
    const enrichedUsers = await Promise.all(engagedUsers.map(async (u) => {
      const unreadCount = await Message.countDocuments({
        senderId: u._id,
        receiverId: currentUserId,
        isRead: false
      });
      return { ...u.toObject(), unreadCount };
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching engaged users', error: error.message });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile (Self or Admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this profile' });
    }

    const { name, profile, plan } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (plan) user.plan = plan;
    if (profile) {
      if (!user.profile) user.profile = {};
      for (const key in profile) {
        user.profile[key] = profile[key];
      }
      user.markModified('profile');
    }
    
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get all developers (Students)
router.get('/developers/search', async (req, res) => {
  try {
    const developers = await User.find({ role: 'student' }).select('-password');
    developers.sort((a, b) => (b.profile?.rating || 0) - (a.profile?.rating || 0));
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: 'Error searching developers', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;
