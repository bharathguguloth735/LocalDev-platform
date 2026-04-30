import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { sendWelcomeEmail, sendOtpEmail } from '../utils/email.js';
import { OAuth2Client } from 'google-auth-library';
import SessionLog from '../models/SessionLog.js';

// Temporary memory store for OTPs (in production, use Redis)
const emailOtpStore = {};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'localdev_connect_super_secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── SEND OTP ─────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    emailOtpStore[email.trim().toLowerCase()] = { otp, expires: Date.now() + 600000 }; // 10 mins

    await sendOtpEmail(email, otp);
    
    res.status(200).json({ message: 'Verification code sent to Gmail.' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// ── REGISTER USER ────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    let {
      name, firstName = '', lastName = '', email, password, role,
      university, skills, companyName, address, otp
    } = req.body;

    email = email ? email.trim().toLowerCase() : '';

    // ── Verify OTP ───────────────────────────────────────────────────
    const isTest = process.env.NODE_ENV === 'test';
    if (!isTest) {
      const stored = emailOtpStore[email];
      if (!stored || stored.otp.toString() !== otp?.toString()) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' });
      }
      if (stored.expires < Date.now()) {
        delete emailOtpStore[email];
        return res.status(400).json({ message: 'Verification code expired.' });
      }
      delete emailOtpStore[email]; // Clear after use
    }

    // ── Check duplicate user ───────────────────────────────────────────
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });

    // ── Hash password & save ───────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── Auto-generate Username ───────────────────────────────────────
    let generatedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const userExists = await User.findOne({ username: generatedUsername });
    if (userExists) {
      generatedUsername = `${generatedUsername}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const user = new User({
      name: name || `${firstName} ${lastName}`.trim() || 'User',
      username: generatedUsername,
      firstName: name ? name.split(' ')[0] : firstName.trim(),
      lastName: name ? name.split(' ').slice(1).join(' ') : lastName.trim(),
      email,
      password: hashedPassword,
      role: role || 'client',
      isEmailVerified: true,
      profile: {
        rating: 5.0,
        bio: companyName ? `${companyName}` : '',
        university: university ? university.trim() : '',
        skills: skills
          ? skills.split(',').map(s => s.trim()).filter(Boolean)
          : (role === 'student' ? ['React', 'Node.js'] : []),
        address: address || {}
      }
    });

    await user.save();

    // Send Real-time Welcome Email (don't await so registration is fast)
    sendWelcomeEmail(user.email, user.name).catch(e => console.error('Failed to send welcome email:', e));

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const session = await SessionLog.create({
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
    });

    res.status(201).json({
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isEmailVerified: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'client' } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required.' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email: rawEmail, picture: avatar } = payload;

    const email = rawEmail.trim().toLowerCase();
    let user = await User.findOne({ email });
    let needsOnboarding = false;

    if (!user) {
      needsOnboarding = true;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`google_${googleId || Date.now()}`, salt);

      user = new User({
        name: name || email.split('@')[0],
        firstName: name ? name.split(' ')[0] : '',
        lastName: name ? name.split(' ').slice(1).join(' ') : '',
        email,
        password: hashedPassword,
        role: 'client', // Default to client initially
        onboarded: false, 
        isEmailVerified: true,
        profile: {
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
          rating: 5.0,
          skills: [],
          bio: `Joined via Google`
        }
      });

      await user.save();
    } else if (!user.onboarded) {
       // Even if they exist, if they never finished onboarding, let them choose.
       needsOnboarding = true;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const session = await SessionLog.create({
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
    });

    res.status(200).json({
      token,
      sessionId: session._id,
      isNewUser: needsOnboarding, // Using same flag name for frontend compatibility
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        onboarded: user.onboarded
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google auth failed', error: error.message });
  }
});

// ── UPDATE ROLE (New User Setup) ──────────────────────────────────────────
router.put('/update-role', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['client', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selection.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    user.onboarded = true; // Mark as onboarded
    await user.save();

    // Re-generate token with new role
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Role updated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
});

// ── GOOGLE PROFILE (access_token flow) ───────────────────────────────────
router.post('/google-profile', async (req, res) => {
  try {
    const { googleId, name, email: rawEmail, avatar, role = 'client' } = req.body;
    if (!rawEmail) return res.status(400).json({ message: 'Google account email is required.' });

    const email = rawEmail.trim().toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`google_${googleId || Date.now()}`, salt);

      user = new User({
        name: name || email.split('@')[0],
        firstName: name ? name.split(' ')[0] : '',
        lastName: name ? name.split(' ').slice(1).join(' ') : '',
        email,
        password: hashedPassword,
        role,
        isEmailVerified: true,
        profile: {
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
          rating: 5.0,
          skills: [],
          bio: 'Joined via Google'
        }
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    const session = await SessionLog.create({
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
    });

    res.status(200).json({
      token,
      sessionId: session._id,
      user: { id: user._id, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified }
    });
  } catch (error) {
    console.error('Google Profile Auth Error:', error);
    res.status(500).json({ message: 'Google auth failed', error: error.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with this email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password.' });



    // HARD-CODED MASTER ADMIN OVERRIDE
    if (user.email === 'bharathguguloth735@gmail.com') {
      user.role = 'admin';
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const session = await SessionLog.create({
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
    });

    res.status(200).json({
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    emailOtpStore[email.trim().toLowerCase()] = { otp, expires: Date.now() + 600000 }; // 10 mins

    await sendOtpEmail(email, otp);
    
    res.status(200).json({ message: 'Verification code sent to email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// ── RESET PASSWORD ───────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = emailOtpStore[cleanEmail];

    if (!stored || stored.otp.toString() !== otp?.toString()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    if (stored.expires < Date.now()) {
      delete emailOtpStore[cleanEmail];
      return res.status(400).json({ message: 'Verification code expired.' });
    }

    delete emailOtpStore[cleanEmail];

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// ── UPDATE PASSWORD ───────────────────────────────────────────────────────
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

// ── LOGOUT ─────────────────────────────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      const session = await SessionLog.findById(sessionId);
      if (session) {
        session.logoutTime = new Date();
        session.durationSeconds = Math.floor((session.logoutTime - session.loginTime) / 1000);
        await session.save();
      }
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
});

// ── GET CURRENT USER ─────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // HARD-CODED MASTER ADMIN OVERRIDE
    if (user.email === 'bharathguguloth735@gmail.com') {
      user.role = 'admin';
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

export default router;
