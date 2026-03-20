import mongoose from 'mongoose';

const questionAttemptSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number, required: true },   // index 0-3
    selectedOption: { type: Number, default: -1 },       // -1 = skipped / timed-out
    isCorrect: { type: Boolean, default: false },
    isSkipped: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 },        // seconds
    earnedScore: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 100 },
});

const quizHistorySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        quizTitle: { type: String, required: true },
        quizCategory: { type: String, default: 'General' },
        examName: { type: String, default: '' },   // stored from AI quiz topic
        topicName: { type: String, default: '' },

        attempts: [questionAttemptSchema],

        totalQuestions: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 },
        incorrectCount: { type: Number, default: 0 },
        skippedCount: { type: Number, default: 0 },
        finalScore: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },   // 0-100 %
        rank: { type: Number, default: 1 },
        totalPlayers: { type: Number, default: 1 },
        duration: { type: Number, default: 0 },   // seconds

        // AI suggestion stored after generation (avoid re-calling API)
        aiSuggestion: { type: String, default: '' },
        suggestionGeneratedAt: { type: Date },
    },
    { timestamps: true }
);

// Index for fast user history queries
quizHistorySchema.index({ user: 1, createdAt: -1 });

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);
export default QuizHistory;