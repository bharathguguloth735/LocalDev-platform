import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

router.get('/', verifyToken, requireRole(['student']), async (req, res) => {
  try {
    const certs = await Certificate.find({ studentId: req.user.id })
       .populate('projectId', 'title')
       .populate('clientId', 'name');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
});

export default router;
