import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '🦊' },
  score: { type: Number, default: 0 },
  answers: [
    {
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      timeBonus: Number,
      usedDoubleScore: { type: Boolean, default: false },
      submittedAt: Date,
    },
  ],
  powerUpsUsed: {
    skip: { type: Number, default: 0 },
    doubleScore: { type: Number, default: 0 },
  },
  joinedAt: { type: Date, default: Date.now },
  isReady: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
});

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, length: 6 },
    name: { type: String, required: true, trim: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [participantSchema],
    status: {
      type: String,
      enum: ['waiting', 'starting', 'active', 'finished'],
      default: 'waiting',
    },
    maxParticipants: { type: Number, default: 10, min: 2, max: 50 },
    currentQuestion: { type: Number, default: 0 },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    settings: {
      allowPowerUps: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: true },
      antiCheat: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Generate unique 6-char room code
roomSchema.statics.generateCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const Room = mongoose.model('Room', roomSchema);
export default Room;
