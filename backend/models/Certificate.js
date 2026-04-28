import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  certificateNumber: { type: String, required: true },
  issueDate: { type: Date, default: Date.now }
});

export default mongoose.model('Certificate', certificateSchema);
