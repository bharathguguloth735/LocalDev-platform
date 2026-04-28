import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Keep full name for compatibility, or we can use it to store firstName + lastName. Let's keep `name` and add `phone`. But the user wants first and last name.
  firstName: { type: String },
  lastName: { type: String },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true },
  role: { type: String, enum: ['client', 'student', 'admin'], default: 'client' },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  isEmailVerified: { type: Boolean, default: false },
  portfolioTheme: { type: String, default: 'modern' },
  profile: {
    avatar: String,
    title: String,
    bio: String,
    hourlyRate: Number,
    location: String,
    // Fields specific to student
    skills: [String],
    university: String,
    address: {
      flat: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    educationDetails: String,
    projectsCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    githubUrl: String,
    portfolioUrl: String,
    linkedinUrl: String,
    twitterUrl: String,
    pastProjects: [{
      title: String,
      description: String,
      url: String,
      image: String
    }]
  },
  wallet_balance: { type: Number, default: 0 },
  onboarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
