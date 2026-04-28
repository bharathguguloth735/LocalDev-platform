import mongoose from 'mongoose';

const sessionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  durationSeconds: { type: Number, default: 0 },
  ipAddress: { type: String },
  userAgent: { type: String },
  platform: { type: String }
});

export default mongoose.model('SessionLog', sessionLogSchema);
