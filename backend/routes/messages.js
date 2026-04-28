import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/email.js';
import { getIO } from '../socketService.js';

const router = express.Router();

// Get Messages between Logged-in User and otherUserId
router.get('/:otherUserId', verifyToken, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    const threadMessages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages received by current user in this thread as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(threadMessages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send Message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const currentUserId = req.user.id || req.user._id;

    // Check for project engagement before allowing message
    const engagement = await Project.findOne({
      $or: [
        { client: currentUserId, developer: receiverId },
        { client: receiverId, developer: currentUserId }
      ]
    });

    if (!engagement && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Mission Alert: Messaging restricted until project engagement is finalized.' });
    }

    const newMessage = new Message({
      senderId: currentUserId,
      receiverId,
      text
    });

    await newMessage.save();

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const sender = await User.findById(currentUserId);
      console.log('[Diagnostic] Attempting to create notification for:', receiverId);
      const notif = new Notification({
        recipient: receiverId,
        sender: currentUserId,
        type: 'message',
        title: 'New Message Received',
        message: `You have a new message from ${sender?.name || 'a partner'}.`,
        link: `/messages?userId=${currentUserId}`
      });
      await notif.save();
      
      const receiverIdStr = receiverId.toString();
      const payload = {
        ...newMessage.toObject(),
        senderName: sender?.name || 'Partner'
      };
      console.log(`[Diagnostic] Emitting notification:new to room ${receiverIdStr} for type: message`);
      getIO().to(receiverIdStr).emit('notification:new', notif);
      getIO().to(receiverIdStr).emit('message:new', payload);
    } catch (err) { console.error('Message Notif Failed:', err); }

    // ── Send Email Notification ──────────────────────────
    try {
      const receiver = await User.findById(receiverId);
      const sender = await User.findById(currentUserId);
      
      if (receiver && receiver.email) {
        const subject = `New message from ${sender.name} on LocalDev Connect`;
        const htmlContent = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <p><strong>${sender.name}</strong> sent you a new message:</p>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic;">"${text}"</p>
            <a href="http://localhost:5173/dashboard/messages" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Reply in App</a>
          </div>
        `;
        sendEmail(receiver.email, subject, htmlContent).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to send message email notification:', err);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

export default router;
