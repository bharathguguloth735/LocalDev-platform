import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['Website', 'App', 'UI/UX'], required: true },
  budget: { type: Number },
  status: { type: String, enum: ['open', 'matched', 'in_progress', 'review', 'completed'], default: 'open' },
  progress: { type: Number, default: 0 },
  isReviewed: { type: Boolean, default: false },
  submission: {
    githubUrl: String,
    liveUrl: String,
    notes: String,
    outputAsset: String, // Base64 image/document proof
    report: String,      // Technical report/summary
    submittedAt: { type: Date }
  },
  currentPhase: { type: Number, default: 1 },
  phases: [{
    phaseId: Number,
    title: String,
    description: String,
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    deliverables: {
      videoUrl: String,
      pdfUrl: String,
      photoUrl: String,
      submittedAt: Date
    }
  }],
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chatRoomId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── Virtual for Review ──────────────────────────────────────────────────
projectSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'project',
  justOne: true
});

export default mongoose.model('Project', projectSchema);
