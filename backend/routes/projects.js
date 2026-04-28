import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socketService.js';

const router = express.Router();

// ── GET all projects (filterable by client/status) ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.client) filter.client = req.query.client;
    if (req.query.status) filter.status = req.query.status;
    const projects = await Project.find(filter)
      .populate('client', 'name email profile.avatar')
      .populate('applicants', 'name email profile.avatar profile.skills')
      .populate('developer', 'name email profile.avatar profile.skills')
      .populate('review')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed fetching projects' });
  }
});

// ── GET student's hired jobs ──────────────────────────────────────────────
router.get('/my/jobs', verifyToken, requireRole(['student']), async (req, res) => {
  try {
    const projects = await Project.find({ developer: req.user.id })
      .populate('client', 'name email profile.avatar')
      .populate('review')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed fetching your jobs', error: err.message });
  }
});

// ── GET single project ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email profile.avatar')
      .populate('applicants', 'name email profile.avatar profile.skills')
      .populate('developer', 'name email profile.avatar profile.skills')
      .populate('review');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed fetching project', error: err.message });
  }
});

// ── POST create project (Client only) ────────────────────────────────────
router.post('/', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const { title, description, category, budget } = req.body;
    const project = new Project({
      title, description, category, budget,
      client: req.user.id,
      status: 'open',
      progress: 0,
      applicants: []
    });
    await project.save();
    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar');

    // 🔴 Real-time: tell everyone a new project is available (for Explore Jobs)
    getIO().emit('project:created', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// ── POST apply to project (Student) ──────────────────────────────────────
router.post('/:id/apply', verifyToken, requireRole(['student', 'client', 'admin']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'This project is no longer accepting applications.' });

    const alreadyApplied = project.applicants.some(a => a.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ message: 'You have already applied to this project!' });

    project.applicants.push(req.user.id);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('applicants', 'name email profile.avatar profile.skills')
      .populate('developer', 'name email profile.avatar profile.skills');

    // 🔴 Real-time: instantly update client's project card with new applicant
    getIO().to(project.client.toString()).emit('project:applicant_added', populated);

    // ── Create Persistent Notification for Client ──────────────────────────
    try {
      const sender = await User.findById(req.user.id);
      const notif = new Notification({
        recipient: project.client,
        sender: req.user.id,
        type: 'submission', // Using submission icon as it fits 'application'
        title: 'New Applicant Detected',
        message: `${sender?.name || 'A developer'} has applied for "${project.title}".`,
        link: '/client-dashboard/projects'
      });
      await notif.save();
      getIO().to(project.client.toString()).emit('notification:new', notif);
    } catch (err) { console.error('Apply Notif Failed:', err); }

    console.log(`[APPLY] Student ${req.user.id} applied to project "${project.title}"`);
    res.status(200).json({ message: 'Application submitted successfully!', project: populated });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ message: 'Failed to apply', error: err.message });
  }
});

// ── POST hire student (Client) ─────────────────────────────────────────────
router.post('/:id/hire/:studentId', verifyToken, requireRole(['client', 'admin', 'student']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can hire developers.' });
    }
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'A developer is already hired for this project.' });
    }

    const student = await User.findById(req.params.studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    project.developer = req.params.studentId;
    project.status = 'in_progress';
    project.progress = 5;
    project.updatedAt = new Date();
    
    // ── Initialize Phases Protocol ──
    project.currentPhase = 1;
    project.phases = [
      { phaseId: 1, title: 'Requirement Architecture', description: 'Establishing technical specifications and stack protocol.', status: 'active' },
      { phaseId: 2, title: 'Prototype & UI Design', description: 'Visualizing the interface and interactive wireframes.', status: 'pending' },
      { phaseId: 3, title: 'Alpha Development', description: 'Core feature construction and logic implementation.', status: 'pending' },
      { phaseId: 4, title: 'Beta Testing & Audit', description: 'Quality assurance and final performance audit.', status: 'pending' }
    ];

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('developer', 'name email profile.avatar profile.skills')
      .populate('applicants', 'name email profile.avatar');

    // 🔴 Real-time: push hired notification directly to the student
    const studentIdStr = req.params.studentId.toString();
    getIO().to(studentIdStr).emit('project:hired', {
      project: populated,
      message: `🎉 You've been hired for "${project.title}"!`
    });

    // ── Create Persistent Notification ─────────────────────────────────────
    try {
      const Notification = (await import('../models/Notification.js')).default;
      const currentUserId = req.user.id || req.user._id;
      const notif = new Notification({
        recipient: req.params.studentId,
        sender: currentUserId,
        type: 'hire',
        title: 'Mission Selection Confirmed!',
        message: `A client has selected you for "${project.title}". Check your Active Missions dossier to begin.`,
        link: '/student-dashboard/jobs'
      });
      await notif.save();
      getIO().to(studentIdStr).emit('notification:new', notif);
    } catch (err) { console.error('Hire Notif Failed:', err); }

    // 🔴 Real-time: update client's own project list
    const clientUserId = req.user.id || req.user._id;
    getIO().to(clientUserId.toString()).emit('project:updated', populated);

    console.log(`[HIRE] Client ${clientUserId} hired student "${student.name}" for project "${project.title}"`);
    res.status(200).json({ message: `${student.name} has been hired!`, project: populated });
  } catch (err) {
    console.error('Hire error:', err);
    res.status(500).json({ message: 'Failed to hire developer', error: err.message });
  }
});

// ── PUT update project details (Client only) ──────────────────────────────
router.put('/:id', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if the user is the owner or an admin
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can edit this mission.' });
    }

    // Only allow editing if the project is still open
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Cannot edit a project that is already in progress or completed.' });
    }

    const { title, description, category, budget } = req.body;
    project.title = title || project.title;
    project.description = description || project.description;
    project.category = category || project.category;
    project.budget = budget || project.budget;
    project.updatedAt = new Date();

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar');

    // 🔴 Real-time: update relevant dashboards
    getIO().emit('project:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// ── PATCH update project progress ─────────────────────────────────────────
router.patch('/:id/progress', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const { progress } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { progress, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).populate('client', 'name email').populate('developer', 'name email');

    // 🔴 Real-time: notify both client and developer
    if (project.developer) getIO().to(project.developer._id.toString()).emit('project:updated', project);
    getIO().to(project.client._id.toString()).emit('project:updated', project);

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
});

// ── DELETE project ────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    await Project.findByIdAndDelete(req.params.id);

    // 🔴 Real-time: tell client to remove it from list
    getIO().to(req.user.id).emit('project:deleted', req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
});

// ── POST deliver project (Student) ─────────────────────────────────────────
router.post('/:id/submit', verifyToken, requireRole(['student', 'client', 'admin']), async (req, res) => {
  try {
    const { githubUrl, liveUrl, notes, outputAsset, report } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.developer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the assigned developer for this project.' });
    }

    project.submission = { 
      githubUrl, 
      liveUrl, 
      notes, 
      outputAsset, 
      report, 
      submittedAt: new Date() 
    };
    project.status = 'review';
    project.progress = 100;
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('developer', 'name email profile.avatar');

    // 🔴 Real-time: notify client
    const clientIdStr = project.client.toString();
    getIO().to(clientIdStr).emit('project:submitted', populated);
    
    // Also notify student to update their UI
    const studentUserId = req.user.id || req.user._id;
    getIO().to(studentUserId.toString()).emit('project:updated', populated);

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const notif = new Notification({
        recipient: project.client,
        sender: studentUserId,
        type: 'submission',
        title: 'Technical Submission Received',
        message: `Deliverables for "${project.title}" are ready for audit.`,
        link: '/client-dashboard/submissions'
      });
      await notif.save();
      getIO().to(clientIdStr).emit('notification:new', notif);
    } catch (err) { console.error('Notif failed:', err); }

    res.json({ message: 'Project submitted for review!', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting project', error: err.message });
  }
});

// ── POST approve delivery (Client) ─────────────────────────────────────────
router.post('/:id/approve', verifyToken, requireRole(['client', 'admin', 'student']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can approve delivery.' });
    }

    project.status = 'completed';
    project.progress = 100;
    await project.save();

    // ── Release Escrow Funds Node ──────────────────────────────────────────
    try {
      const Payment = (await import('../models/Payment.js')).default;
      const payment = await Payment.findOne({ projectId: project._id, status: 'escrow' });
      if (payment) {
        payment.status = 'released';
        await payment.save();
        console.log(`[PAYMENT] Funds released for Project ${project._id}`);
      }
    } catch (payErr) {
       console.error('[PAYMENT_ERROR] Settlement failed:', payErr);
    }

    // ── Create Reputation Node (Review) ───────────────────────────────────
    const { rating, comment } = req.body;
    if (rating) {
      try {
        const Review = (await import('../models/Review.js')).default;
        const newReview = new Review({
          project: project._id,
          client: project.client,
          developer: project.developer,
          rating: Number(rating) || 5,
          comment: comment || 'Project completed successfully.'
        });
        await newReview.save();
        
        // Mark project as reviewed to clear from 'Action Required' view
        project.isReviewed = true;
        await project.save();
        
        console.log(`[REVIEW] Reputation node archived for Project ${project._id}`);
      } catch (revErr) {
        console.error('[REVIEW_ERROR] Failed to archive reputation:', revErr);
      }
    }

    // ── Auto-Generate Certificate Node ──────────────────────────────────────
    try {
      const Certificate = (await import('../models/Certificate.js')).default;
      const certNumber = `LDC-${project._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      const newCert = new Certificate({
        studentId: project.developer,
        clientId: project.client,
        projectId: project._id,
        certificateNumber: certNumber,
        issueDate: new Date()
      });
      await newCert.save();
      console.log(`[CERT] Node generated for Project ${project._id}: ${certNumber}`);
    } catch (certErr) {
       console.error('[CERT_ERROR] Failed to auto-generate node:', certErr);
    }

    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('developer', 'name email profile.avatar');

    // 🔴 Real-time: notify developer
    if (project.developer) {
      getIO().to(project.developer.toString()).emit('project:approved', populated);
      getIO().to(project.developer.toString()).emit('project:updated', populated);
    }
    
    // Also update client
    getIO().to(req.user.id).emit('project:updated', populated);

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const currentUserId = req.user.id || req.user._id;
      const notif = new Notification({
        recipient: project.developer,
        sender: currentUserId,
        type: 'approval',
        title: 'Validation Successful!',
        message: `Your work on "${project.title}" has been approved. Credentials generated.`,
        link: '/student-dashboard/certificates'
      });
      await notif.save();
      getIO().to(project.developer.toString()).emit('notification:new', notif);
    } catch (err) { console.error('Notif failed:', err); }

    res.json({ message: 'Project approved! The developer has been notified.', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Error approving delivery', error: err.message });
  }
});

// ── POST submit phase deliverables (Student) ──────────────────────────────
router.post('/:id/phases/:phaseId/submit', verifyToken, requireRole(['student']), async (req, res) => {
  try {
    const { videoUrl, pdfUrl, photoUrl } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.developer.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const phase = project.phases.find(p => p.phaseId === Number(req.params.phaseId));
    if (!phase) return res.status(404).json({ message: 'Phase not found' });

    phase.deliverables = {
      videoUrl,
      pdfUrl,
      photoUrl,
      submittedAt: new Date()
    };
    phase.status = 'completed'; // For UI feedback, can be 'pending_approval' if needed
    
    // Update progress based on phase (25% each)
    project.progress = Math.min(100, project.progress + 20); 
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('developer', 'name email profile.avatar');

    // 🔴 Real-time: Notify Client
    getIO().to(project.client.toString()).emit('project:phase_submitted', { project: populated, phaseId: req.params.phaseId });
    getIO().to(req.user.id).emit('project:updated', populated);

    res.json({ message: 'Phase deliverables transmitted successfully.', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Phase submission failed', error: err.message });
  }
});

// ── POST approve phase and move to next (Client) ──────────────────────────
router.post('/:id/phases/:phaseId/approve', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    const currentPhaseIndex = project.phases.findIndex(p => p.phaseId === Number(req.params.phaseId));
    if (currentPhaseIndex === -1) return res.status(404).json({ message: 'Phase not found' });

    project.phases[currentPhaseIndex].status = 'completed';
    
    // Unlock next phase if exists
    if (currentPhaseIndex < project.phases.length - 1) {
      project.phases[currentPhaseIndex + 1].status = 'active';
      project.currentPhase = project.phases[currentPhaseIndex + 1].phaseId;
    } else {
       // All phases done, move project to review status
       project.status = 'review';
       project.progress = 100;
    }

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('client', 'name email profile.avatar')
      .populate('developer', 'name email profile.avatar');

    // 🔴 Real-time: Notify Developer
    getIO().to(project.developer.toString()).emit('project:phase_approved', { project: populated, phaseId: req.params.phaseId });
    getIO().to(req.user.id).emit('project:updated', populated);

    res.json({ message: 'Phase approved. Next sequence initiated.', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Phase approval failed', error: err.message });
  }
});

export default router;
