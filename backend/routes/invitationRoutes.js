import express from 'express';
import Invitation from '../models/Invitation.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socketService.js';

const router = express.Router();

// @desc    Send an invitation to a developer
// @route   POST /api/invitations
router.post('/', verifyToken, async (req, res) => {
  const { projectId, developerId, message } = req.body;

  try {
    const currentUserId = req.user.id || req.user._id;
    const invitation = new Invitation({
      project: projectId,
      client: currentUserId,
      developer: developerId,
      message
    });

    const savedInvitation = await invitation.save();

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const notif = new Notification({
        recipient: developerId,
        sender: currentUserId,
        type: 'system',
        title: 'Project Invitation Received',
        message: 'A client has invited you to collaborate on a new mission.',
        link: '/student-dashboard/requests'
      });
      await notif.save();
      getIO().to(developerId.toString()).emit('notification:new', notif);
    } catch (err) { console.error('Notif failed:', err); }

    res.status(201).json(savedInvitation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get invitations for the logged-in student
// @route   GET /api/invitations/my-invites
router.get('/my-invites', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const invitations = await Invitation.find({ developer: currentUserId })
      .populate('project')
      .populate('client', 'name profile')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
