import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';
import { getIO } from '../socketService.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Razorpay from 'razorpay';

// Razorpay is initialized dynamically to prevent ES Module hoisting bugs


const router = express.Router();

// ── SIMULATE PAYMENT ORDER (No Razorpay needed) ─────────────────────────────
// Returns a mock order ID instantly so the frontend can proceed
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount, projectId, studentId, isDeposit, isSubscription } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount.' });
    }

    if (!isDeposit && !isSubscription && (!projectId || !studentId)) {
      return res.status(400).json({ message: 'Missing project/student details.' });
    }

    // Generate a live Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    // Initialize Razorpay dynamically to ensure .env is loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      simulated: false
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
});

// ── WALLET DEPOSIT (Direct, no Razorpay) ─────────────────────────────────────
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount.' });
    }

    const txnId = `TXN-DEP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create Payment Record
    const payment = new Payment({
      type: 'deposit',
      clientId: req.user.id,
      totalAmount: amountNum,
      platformFee: 0,
      studentAmount: 0,
      status: 'completed',
      transactionId: txnId
    });
    await payment.save();

    // Update User Wallet Balance
    const user = await User.findById(req.user.id);
    user.wallet_balance = (user.wallet_balance || 0) + amountNum;
    await user.save();

    // 🔴 Real-time: push wallet update to the user
    getIO().to(req.user.id).emit('wallet:updated', {
      balance: user.wallet_balance,
      transaction: payment,
      message: `✅ ₹${amountNum.toLocaleString()} added to your wallet!`
    });

    res.status(200).json({
      success: true,
      message: `₹${amountNum.toLocaleString()} deposited successfully!`,
      balance: user.wallet_balance,
      transaction: payment
    });

  } catch (err) {
    console.error('Deposit Error:', err);
    res.status(500).json({ message: 'Error processing deposit', error: err.message });
  }
});

// ── VERIFY RAZORPAY DEPOSIT ──────────────────────────────────────────────────
router.post('/deposit/verify-razorpay', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    
    // Create the expected signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YXGdmgSfq7h1LkPkTgWlFWJK';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');
      
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature. Transaction rejected.' });
    }

    const amountNum = parseFloat(amount);
    const txnId = `TXN-RZP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create Payment Record
    const payment = new Payment({
      type: 'deposit',
      clientId: req.user.id,
      totalAmount: amountNum,
      status: 'completed',
      transactionId: txnId
    });
    await payment.save();

    // Update User Wallet Balance
    const user = await User.findById(req.user.id);
    user.wallet_balance = (user.wallet_balance || 0) + amountNum;
    await user.save();

    // 🔴 Real-time update
    getIO().to(req.user.id).emit('wallet:updated', {
      balance: user.wallet_balance,
      transaction: payment,
      message: `✅ ₹${amountNum.toLocaleString()} securely added via Razorpay!`
    });

    res.status(200).json({
      success: true,
      message: `₹${amountNum.toLocaleString()} deposited securely via Razorpay!`,
      balance: user.wallet_balance,
      transaction: payment
    });

  } catch (err) {
    console.error('Razorpay Verification Error:', err);
    res.status(500).json({ message: 'Error verifying payment', error: err.message });
  }
});

// ── VERIFY WALLET DEPOSIT (Legacy endpoint) ───────────────────────────────────
router.post('/deposit/verify', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: 'Invalid amount.' });
    }

    const txnId = `TXN-DEP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const payment = new Payment({
      type: 'deposit',
      clientId: req.user.id,
      totalAmount: amountNum,
      status: 'completed',
      transactionId: txnId
    });
    await payment.save();

    const user = await User.findById(req.user.id);
    user.wallet_balance = (user.wallet_balance || 0) + amountNum;
    await user.save();

    getIO().to(req.user.id).emit('wallet:updated', {
      balance: user.wallet_balance,
      transaction: payment,
      message: `✅ ₹${amountNum.toLocaleString()} added to your wallet!`
    });

    res.status(200).json({
      success: true,
      message: 'Wallet topped up successfully!',
      balance: user.wallet_balance,
      transaction: payment
    });

  } catch (err) {
    console.error('Deposit Verify Error:', err);
    res.status(500).json({ message: 'Error verifying deposit', error: err.message });
  }
});

// ── GET TRANSACTIONS ──────────────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    const filter = role === 'client' ? { clientId: userId } : { studentId: userId };
    const payments = await Payment.find(filter)
      .populate('projectId', 'title')
      .populate('clientId', 'name email')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// ── DIRECT CHECKOUT (Pay upon project completion) ────────────────────────────
router.post('/checkout', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const { projectId, studentId, amount, method } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ message: 'Missing projectId or amount.' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // ── Strategic Status Check ──
    if (project.status !== 'review' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Strategic Lock: This mission has not been submitted for final audit yet. Payout protocol is disabled.' 
      });
    }

    const resolvedStudentId = studentId || project.developer;
    const txnId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const platformFee = amount * 0.1;
    const studentAmount = amount - platformFee;

    const payment = new Payment({
      projectId,
      clientId: req.user.id,
      studentId: resolvedStudentId,
      totalAmount: amount,
      platformFee,
      studentAmount,
      status: 'released',
      transactionId: txnId
    });
    // Update User Wallet Balance for Student
    const student = await User.findById(resolvedStudentId);
    if (student) {
      student.wallet_balance = (student.wallet_balance || 0) + studentAmount;
      await student.save();
      
      // Notify student of wallet update
      getIO().to(student._id.toString()).emit('wallet:updated', {
        balance: student.wallet_balance,
        message: `💰 ₹${studentAmount.toLocaleString()} credited for ${project.title}`
      });
    }

    // Update project to completed
    project.status = 'completed';
    project.progress = 100;
    project.updatedAt = new Date();
    await project.save();

    // Issue Certificate
    const certNumber = 'LDC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const cert = new Certificate({
      studentId: resolvedStudentId,
      clientId: req.user.id,
      projectId,
      certificateNumber: certNumber
    });
    await cert.save();

    // 🔴 Real-time notifications
    getIO().to(req.user.id).emit('project:updated', project);
    if (resolvedStudentId) {
      getIO().to(resolvedStudentId.toString()).emit('payment:released', {
        amount: studentAmount,
        projectTitle: project.title,
        cert
      });
    }

    res.status(200).json({ success: true, message: 'Payment completed and project closed.', payment, cert });
  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── RELEASE ESCROW ────────────────────────────────────────────────────────────
router.post('/project/:projectId/release', verifyToken, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const payment = await Payment.findOne({ projectId: req.params.projectId, status: 'escrow' });
    if (!payment) return res.status(404).json({ message: 'Active escrow payment not found.' });

    if (payment.clientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    payment.status = 'released';
    await payment.save();

    // Update Student Wallet Balance
    const student = await User.findById(payment.studentId);
    if (student) {
      student.wallet_balance = (student.wallet_balance || 0) + payment.studentAmount;
      await student.save();

      getIO().to(student._id.toString()).emit('wallet:updated', {
        balance: student.wallet_balance,
        message: `💰 ₹${payment.studentAmount.toLocaleString()} released for project.`
      });
    }

    const project = await Project.findById(payment.projectId);
    if (project) {
      project.status = 'completed';
      project.progress = 100;
      project.updatedAt = new Date();
      await project.save();
    }

    const certNumber = 'LDC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const cert = new Certificate({
      studentId: payment.studentId,
      clientId: payment.clientId,
      projectId: payment.projectId,
      certificateNumber: certNumber
    });
    await cert.save();

    // 🔴 Real-time: Notify Student
    getIO().to(payment.studentId.toString()).emit('payment:released', {
      amount: payment.studentAmount,
      projectTitle: project?.title,
      cert
    });

    res.json({ message: 'Funds released and certificate generated.', payment, cert });
  } catch (err) {
    res.status(500).json({ message: 'Error releasing funds', error: err.message });
  }
});

// ── WITHDRAW FUNDS ──────────────────────────────────────────────────────────
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, upiId, bankDetails, method = 'upi' } = req.body;
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount.' });
    }

    const user = await User.findById(req.user.id);
    
    // ── Robust Balance Calculation ──────────────────────────────────────────
    // If the wallet_balance field is out of sync, we calculate from ledger
    const allPayments = await Payment.find({ studentId: req.user.id });
    const released = allPayments.filter(p => p.status === 'released').reduce((acc, curr) => acc + curr.studentAmount, 0);
    const withdrawn = allPayments.filter(p => p.type === 'withdrawal').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const calculatedBalance = released - withdrawn;

    // Use the higher of the two (or sync them)
    const effectiveBalance = Math.max(user.wallet_balance || 0, calculatedBalance);

    if (effectiveBalance < amountNum) {
      return res.status(400).json({ 
        message: 'Insufficient balance.', 
        calculated: calculatedBalance, 
        wallet: user.wallet_balance 
      });
    }

    // Provisionally sync wallet_balance if it was lower
    if (user.wallet_balance < effectiveBalance) {
      user.wallet_balance = effectiveBalance;
    }

    const txnId = `TXN-WTH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Deduct from Balance
    user.wallet_balance -= amountNum;
    await user.save();

    const currentUserId = req.user.id || req.user._id;
    if (!currentUserId) {
       console.error('[Withdrawal Error] No User ID found in token:', req.user);
       return res.status(401).json({ message: 'Authentication context lost. Please re-login.' });
    }

    // Create Payment Record (Withdrawal)
    const payment = new Payment({
      type: 'withdrawal',
      clientId: currentUserId,
      studentId: currentUserId,
      totalAmount: amountNum,
      status: 'completed',
      transactionId: txnId,
    });
    await payment.save();

    // ── Create Notification ────────────────────────────────────────────────
    try {
      const notif = new Notification({
        recipient: currentUserId,
        type: 'payment',
        title: 'Capital Disbursement Successful',
        message: `Your withdrawal of ₹${amountNum.toLocaleString()} has been successfully settled via the ${method.toUpperCase()} protocol. Transaction Dossier: ${txnId}`,
        link: '/student-dashboard/earnings'
      });
      await notif.save();
      getIO().to(req.user.id.toString()).emit('notification:new', notif);
    } catch (err) { console.error('Withdrawal Notif Failed:', err); }

    // 🔴 Real-time: push wallet update
    getIO().to(req.user.id.toString()).emit('wallet:updated', {
      balance: user.wallet_balance,
      transaction: payment,
      message: `💸 ₹${amountNum.toLocaleString()} withdrawal initiated!`
    });

    res.status(200).json({
      success: true,
      message: `₹${amountNum.toLocaleString()} withdrawn successfully!`,
      balance: user.wallet_balance,
      transaction: payment
    });

  } catch (err) {
    console.error('Withdrawal Error:', err);
    res.status(500).json({ message: 'Error processing withdrawal', error: err.message });
  }
});

export default router;
