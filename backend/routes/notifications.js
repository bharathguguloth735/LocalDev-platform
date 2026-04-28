import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const rawId = req.user.id || req.user._id;
    if (!rawId) return res.status(401).json({ message: 'Audit failed: No ID found.' });

    const userId = new mongoose.Types.ObjectId(rawId.toString());
    console.log(`[Diagnostic] Finalizing Audit Filter for: ${userId}`);

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`[Diagnostic] Verified Audit Result: ${notifications.length} alerts found for ${userId}`);
    res.json(notifications);
  } catch (err) {
    console.error('[Diagnostic Error] Sector 7 Audit Failed:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all as read
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    const rawId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawId.toString());
    await Notification.updateMany({ recipient: userId }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true },
      { returnDocument: 'after' }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Clear all notifications
router.delete('/clear-all', verifyToken, async (req, res) => {
  try {
    const rawId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawId.toString());
    await Notification.deleteMany({ recipient: userId });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing notifications' });
  }
});

// Delete specific notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: userId });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

export default router;
