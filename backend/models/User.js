import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: function () {
        const avatars = ['🦊', '🐺', '🦁', '🐯', '🦄', '🐉', '🦅', '🐬', '🦋', '🔥'];
        return avatars[Math.floor(Math.random() * avatars.length)];
      },
    },
    totalScore: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    powerUps: {
      skip: { type: Number, default: 3 },
      doubleScore: { type: Number, default: 2 },
    },
    rank: { type: String, default: 'Novice' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update rank based on totalScore
userSchema.methods.updateRank = function () {
  const score = this.totalScore;
  if (score >= 10000) this.rank = 'Grandmaster';
  else if (score >= 5000) this.rank = 'Master';
  else if (score >= 2000) this.rank = 'Expert';
  else if (score >= 1000) this.rank = 'Advanced';
  else if (score >= 500) this.rank = 'Intermediate';
  else this.rank = 'Novice';
};

const User = mongoose.model('User', userSchema);
export default User;
