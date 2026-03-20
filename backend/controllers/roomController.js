import Room from '../models/Room.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import GameSession from '../models/GameSession.js';
import QuizHistory from '../models/QuizHistory.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateScore } from '../utils/scoreCalculator.js';

export const createRoom = async (req, res, next) => {
  try {
    const { name, quizId, maxParticipants = 10, settings } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = Room.generateCode();
      attempts++;
      if (attempts > 10) throw new AppError('Could not generate unique room code', 500);
    } while (await Room.findOne({ code }));

    const room = await Room.create({
      code,
      name,
      quiz: quizId,
      host: req.user._id,
      maxParticipants,
      settings: settings || {},
      participants: [
        {
          user: req.user._id,
          username: req.user.username,
          avatar: req.user.avatar,
          isReady: false,
        },
      ],
    });

    await room.populate('quiz', 'title category difficulty timePerQuestion questions');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { code } = req.body;

    const room = await Room.findOne({ code: code.toUpperCase() }).populate(
      'quiz',
      'title category difficulty timePerQuestion questions'
    );
    if (!room) throw new AppError('Room not found. Check the code and try again.', 404);
    if (room.status !== 'waiting') throw new AppError('Game has already started or ended', 400);
    if (room.participants.length >= room.maxParticipants) throw new AppError('Room is full', 400);

    const alreadyJoined = room.participants.some((p) => p.user.toString() === req.user._id.toString());
    if (!alreadyJoined) {
      room.participants.push({
        user: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
      });
      await room.save();
    }

    res.json({ success: true, message: 'Joined room successfully', data: { room } });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      'quiz',
      'title category difficulty timePerQuestion questions'
    );
    if (!room) throw new AppError('Room not found', 404);

    const isParticipant = room.participants.some((p) => p.user.toString() === req.user._id.toString());
    const isHost = room.host.toString() === req.user._id.toString();
    if (!isParticipant && !isHost) throw new AppError('You are not a member of this room', 403);

    res.json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
};

export const startGame = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('quiz');
    if (!room) throw new AppError('Room not found', 404);
    if (room.host.toString() !== req.user._id.toString()) throw new AppError('Only the host can start the game', 403);
    if (room.status !== 'waiting') throw new AppError('Game already started', 400);
    if (room.participants.length < 1) throw new AppError('Need at least 1 participant', 400);

    room.status = 'active';
    room.startedAt = new Date();
    await room.save();

    // Increment quiz play count
    await Quiz.findByIdAndUpdate(room.quiz._id, { $inc: { playCount: 1 } });

    res.json({ success: true, message: 'Game started!', data: { room } });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { questionIndex, selectedOption, timeTaken, usedDoubleScore = false } = req.body;
    const room = await Room.findById(req.params.roomId).populate('quiz');
    if (!room) throw new AppError('Room not found', 404);
    if (room.status !== 'active') throw new AppError('Game is not active', 400);

    const participantIndex = room.participants.findIndex((p) => p.user.toString() === req.user._id.toString());
    if (participantIndex === -1) throw new AppError('You are not in this room', 403);

    const participant = room.participants[participantIndex];

    // Anti-cheat: check if already answered this question
    const alreadyAnswered = participant.answers.some((a) => a.questionIndex === questionIndex);
    if (alreadyAnswered) throw new AppError('Answer already submitted for this question', 400);

    const question = room.quiz.questions[questionIndex];
    if (!question) throw new AppError('Question not found', 404);

    const isCorrect = selectedOption === question.correctAnswer;
    let earnedScore = 0;

    if (isCorrect) {
      // Check if user has double score power-up available
      if (usedDoubleScore && participant.powerUpsUsed.doubleScore < 2) {
        participant.powerUpsUsed.doubleScore += 1;
      }
      earnedScore = calculateScore(
        question.points,
        timeTaken,
        room.quiz.timePerQuestion,
        usedDoubleScore && participant.powerUpsUsed.doubleScore <= 2
      );
      participant.score += earnedScore;
    }

    participant.answers.push({
      questionIndex,
      selectedOption,
      isCorrect,
      timeBonus: earnedScore - (isCorrect ? question.points : 0),
      usedDoubleScore,
      submittedAt: new Date(),
    });

    await room.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        earnedScore,
        totalScore: participant.score,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const skipQuestion = async (req, res, next) => {
  try {
    const { questionIndex } = req.body;
    const room = await Room.findById(req.params.roomId);
    if (!room) throw new AppError('Room not found', 404);

    const participant = room.participants.find((p) => p.user.toString() === req.user._id.toString());
    if (!participant) throw new AppError('Not in this room', 403);

    const user = await User.findById(req.user._id);
    if (user.powerUps.skip <= 0) throw new AppError('No skip power-ups remaining', 400);

    // Mark as skipped (answered with -1)
    const alreadyAnswered = participant.answers.some((a) => a.questionIndex === questionIndex);
    if (alreadyAnswered) throw new AppError('Question already answered', 400);

    participant.answers.push({
      questionIndex,
      selectedOption: -1,
      isCorrect: false,
      timeBonus: 0,
      submittedAt: new Date(),
    });
    participant.powerUpsUsed.skip += 1;

    await Promise.all([room.save(), User.findByIdAndUpdate(req.user._id, { $inc: { 'powerUps.skip': -1 } })]);

    res.json({ success: true, message: 'Question skipped', data: { remainingSkips: user.powerUps.skip - 1 } });
  } catch (error) {
    next(error);
  }
};

export const finishGame = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('quiz');
    if (!room) throw new AppError('Room not found', 404);
    if (room.host.toString() !== req.user._id.toString()) throw new AppError('Only host can finish game', 403);

    room.status = 'finished';
    room.finishedAt = new Date();
    await room.save();

    // Sort participants by score
    const sortedParticipants = room.participants
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p.toObject(), finalRank: i + 1 }));

    // Save game session
    const winner = sortedParticipants[0];
    await GameSession.create({
      room: room._id,
      quiz: room.quiz._id,
      category: room.quiz.category,
      duration: room.startedAt ? Math.round((Date.now() - room.startedAt) / 1000) : 0,
      winner: winner?.user,
      players: sortedParticipants.map((p, i) => ({
        user: p.user,
        username: p.username,
        avatar: p.avatar,
        finalScore: p.score,
        rank: i + 1,
        correctAnswers: p.answers.filter((a) => a.isCorrect).length,
        totalAnswers: p.answers.length,
        powerUpsUsed: p.powerUpsUsed,
      })),
    });

    // Update user stats + save QuizHistory per participant
    await Promise.all(
      sortedParticipants.map(async (p, i) => {
        const user = await User.findById(p.user);
        if (!user) return;
        user.totalScore += p.score;
        user.gamesPlayed += 1;
        if (i === 0) user.gamesWon += 1;
        user.updateRank();
        await user.save();

        // Build per-question attempt records
        const attempts = room.quiz.questions.map((q, qi) => {
          const ans = p.answers.find((a) => a.questionIndex === qi);
          const selected = ans ? ans.selectedOption : -1;
          const isSkipped = !ans || selected === -1;
          const isCorrect = !isSkipped && selected === q.correctAnswer;
          return {
            questionIndex: qi,
            questionText: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            selectedOption: selected,
            isCorrect,
            isSkipped,
            timeTaken: 0,
            earnedScore: ans ? (ans.timeBonus || 0) + (isCorrect ? q.points : 0) : 0,
            explanation: q.explanation || '',
            difficulty: q.difficulty || 'medium',
            points: q.points || 100,
          };
        });

        const correctCount = attempts.filter((a) => a.isCorrect).length;
        const incorrectCount = attempts.filter((a) => !a.isCorrect && !a.isSkipped).length;
        const skippedCount = attempts.filter((a) => a.isSkipped).length;
        const accuracy = attempts.length > 0
          ? Math.round((correctCount / attempts.length) * 100)
          : 0;

        // Parse exam / topic from AI quiz title  e.g. "AI Quiz: SSC CGL परीक्षा — भारतीय इतिहास"
        let examName = '';
        let topicName = '';
        if (room.quiz.aiGenerated && room.quiz.aiTopic) {
          const parts = room.quiz.aiTopic.split('—');
          examName = (parts[0] || '').replace('परीक्षा', '').trim();
          topicName = (parts[1] || '').trim();
        }

        await QuizHistory.create({
          user: p.user,
          room: room._id,
          quiz: room.quiz._id,
          quizTitle: room.quiz.title,
          quizCategory: room.quiz.category,
          examName,
          topicName,
          attempts,
          totalQuestions: attempts.length,
          correctCount,
          incorrectCount,
          skippedCount,
          finalScore: p.score,
          accuracy,
          rank: i + 1,
          totalPlayers: sortedParticipants.length,
          duration: room.startedAt
            ? Math.round((Date.now() - room.startedAt) / 1000)
            : 0,
        });
      })
    );

    res.json({
      success: true,
      message: 'Game finished',
      data: { leaderboard: sortedParticipants, winner: sortedParticipants[0] },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw new AppError('Room not found', 404);

    const leaderboard = room.participants
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        userId: p.user,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        rank: i + 1,
        correctAnswers: p.answers.filter((a) => a.isCorrect).length,
        totalAnswers: p.answers.length,
      }));

    res.json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};

export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const users = await User.find({ isActive: true })
      .select('username avatar totalScore gamesPlayed gamesWon rank')
      .sort({ totalScore: -1 })
      .limit(Number(limit));

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      username: u.username,
      avatar: u.avatar,
      totalScore: u.totalScore,
      gamesPlayed: u.gamesPlayed,
      gamesWon: u.gamesWon,
      winRate: u.gamesPlayed > 0 ? Math.round((u.gamesWon / u.gamesPlayed) * 100) : 0,
      rank: u.rank,
    }));

    res.json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};