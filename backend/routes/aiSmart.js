import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Smart Match Algorithm (Beta)
router.post('/match-students', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 1. Get project keywords from title and description
    const keywords = [
      ...project.title.toLowerCase().split(' '),
      ...(project.skillsRequired || [])
    ].map(k => k.trim()).filter(k => k.length > 2);

    // 2. Find students with these skills
    // We search for students whose skills or bio contains the keywords
    const students = await User.find({ 
      role: 'student',
      onboarded: true 
    });

    // 3. Ranking Logic
    const rankedStudents = students.map(student => {
      let score = 0;
      const studentSkills = (student.profile?.skills || []).map(s => s.toLowerCase());
      
      // Match 1: Direct Skill Overlap (High Weight)
      const directMatches = keywords.filter(k => studentSkills.includes(k));
      score += directMatches.length * 10;

      // Match 2: Rating Weight
      score += (student.profile?.rating || 0) * 5;

      // Match 3: Experience Weight
      score += (student.profile?.projectsCompleted || 0) * 2;

      return {
        student: {
          id: student._id,
          name: student.name,
          username: student.username,
          avatar: student.profile?.avatar,
          skills: student.profile?.skills,
          rating: student.profile?.rating
        },
        matchScore: score,
        matchReason: directMatches.length > 0 
          ? `Expert in ${directMatches.slice(0, 2).join(', ')}` 
          : 'High reputation student'
      };
    });

    // Sort by score descending
    const finalMatches = rankedStudents
      .filter(s => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Return top 5

    res.status(200).json({
      projectId: project._id,
      matches: finalMatches
    });

  } catch (error) {
    logger.error('AI Smart Match Error:', error);
    res.status(500).json({ message: 'AI matching failed.' });
  }
});

export default router;
