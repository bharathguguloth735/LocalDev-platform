import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['escrow', 'deposit', 'withdrawal'], default: 'escrow' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  studentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['escrow', 'released', 'completed'], default: 'escrow' },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
