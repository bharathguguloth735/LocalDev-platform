import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi', 'bank'], required: true },
  details: {
    vpa: String,
    accountNumber: String,
    ifsc: String
  },
  transactionId: { type: String, unique: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Withdrawal', withdrawalSchema);
