import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import SessionLog from '../models/SessionLog.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ExcelJS from 'exceljs';

const router = express.Router();

router.get('/export-sessions', verifyToken, async (req, res) => {
  try {
    // Ideally check if req.user.role === 'admin' here
    
    const sessions = await SessionLog.find().populate('user', 'name email role').sort({ loginTime: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Sessions');

    worksheet.columns = [
      { header: 'User Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
      { header: 'Platform/Device', key: 'platform', width: 20 },
      { header: 'User Agent', key: 'userAgent', width: 50 },
      { header: 'Login Time', key: 'loginTime', width: 20 },
      { header: 'Logout Time', key: 'logoutTime', width: 20 },
      { header: 'Time Spent (Sec)', key: 'durationSeconds', width: 15 }
    ];

    sessions.forEach(session => {
      worksheet.addRow({
        name: session.user?.name || 'Unknown',
        email: session.user?.email || 'Unknown',
        role: session.user?.role || 'Unknown',
        ipAddress: session.ipAddress || 'Unknown',
        platform: session.platform || 'Unknown',
        userAgent: session.userAgent || 'Unknown',
        loginTime: session.loginTime ? new Date(session.loginTime).toLocaleString() : '',
        logoutTime: session.logoutTime ? new Date(session.logoutTime).toLocaleString() : 'Still Active',
        durationSeconds: session.durationSeconds > 0 ? session.durationSeconds : (
          session.logoutTime ? 0 : Math.floor((Date.now() - new Date(session.loginTime)) / 1000)
        )
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'user-sessions.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'Failed to export sessions', error: error.message });
  }
});

// GET /api/reports/platform-stats
router.get('/platform-stats', verifyToken, async (req, res) => {
  try {
    // Basic check for admin role (can be moved to middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required.' });
    }

    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const clients = await User.countDocuments({ role: 'client' });
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        students,
        clients,
        activeProjects,
        totalProjects,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats', error: error.message });
  }
});

export default router;
