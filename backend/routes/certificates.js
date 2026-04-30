import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

import Project from '../models/Project.js';

// ── GET USER CERTIFICATES ────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { studentId: req.user.id };
    const certs = await Certificate.find(query)
       .populate('projectId', 'title category')
       .populate('studentId', 'name email')
       .populate('clientId', 'name');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
});

// ── GET PENDING CERTIFICATES (ADMIN) ──────────────────────────────────────
router.get('/pending', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    // Find projects that are 'completed' but don't have a certificate yet
    const completedProjects = await Project.find({ status: 'completed' })
      .populate('client', 'name')
      .populate('developer', 'name');
    
    const issuedCertProjectIds = await Certificate.distinct('projectId');
    
    const pending = completedProjects.filter(p => !issuedCertProjectIds.includes(p._id.toString()));
    
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending certificates', error: error.message });
  }
});

// ── ISSUE CERTIFICATE (ADMIN) ─────────────────────────────────────────────
router.post('/issue', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId).populate('client developer');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.developer) return res.status(400).json({ message: 'No developer assigned to this project' });

    // Check if already exists
    const existing = await Certificate.findOne({ projectId });
    if (existing) return res.status(400).json({ message: 'Certificate already issued for this project' });

    const certificate = new Certificate({
      studentId: project.developer._id,
      clientId: project.client._id,
      projectId: project._id,
      certificateNumber: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      issueDate: new Date()
    });

    await certificate.save();
    res.status(201).json({ message: 'Certificate issued successfully', certificate });
  } catch (error) {
    res.status(500).json({ message: 'Error issuing certificate', error: error.message });
  }
});

export default router;
