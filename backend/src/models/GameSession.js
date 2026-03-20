import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        avatar: String,
        finalScore: { type: Number, default: 0 },
        rank: Number,
        correctAnswers: { type: Number, default: 0 },
        totalAnswers: { type: Number, default: 0 },
        powerUpsUsed: { skip: Number, doubleScore: Number },
      },
    ],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    duration: Number, // seconds
    category: String,
  },
  { timestamps: true }
);

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
