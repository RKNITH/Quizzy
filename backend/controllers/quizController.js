import Quiz from '../models/Quiz.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateAIQuiz } from '../utils/aiQuizGenerator.js';
import { seedQuizzes } from '../utils/seedData.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 12 } = req.query;
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);
    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .select('-questions.correctAnswer -questions.explanation')
        .populate('createdBy', 'username avatar')
        .sort({ playCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Quiz.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username avatar');
    if (!quiz) throw new AppError('Quiz not found', 404);

    // Only send correct answers to authenticated users during game (sanitize for listing)
    const sanitized = quiz.toObject();
    if (!req.user) {
      sanitized.questions = sanitized.questions.map(({ question, options, difficulty, points }) => ({
        question,
        options,
        difficulty,
        points,
      }));
    }

    res.json({ success: true, data: { quiz: sanitized } });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Quiz created successfully', data: { quiz } });
  } catch (error) {
    next(error);
  }
};

export const generateAIQuizHandler = async (req, res, next) => {
  try {
    const { topic, difficulty = 'mixed', numQuestions = 10 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new AppError('AI quiz generation के लिए Gemini API key configure नहीं है', 503);
    }

    const questions = await generateAIQuiz({ topic, difficulty, numQuestions });

    const quiz = await Quiz.create({
      title: `AI Quiz: ${topic}`,
      description: `AI-generated quiz about ${topic}`,
      category: 'AI-Generated',
      difficulty,
      questions,
      timePerQuestion: 30,
      createdBy: req.user._id,
      aiGenerated: true,
      aiTopic: topic,
    });

    res.status(201).json({
      success: true,
      message: 'AI quiz generated successfully',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

export const seedQuizzesHandler = async (req, res, next) => {
  try {
    const count = await Quiz.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: `Database already has ${count} quizzes` });
    }

    const quizzes = await Quiz.insertMany(seedQuizzes);
    res.json({ success: true, message: `Seeded ${quizzes.length} quizzes`, data: { count: quizzes.length } });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Quiz.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPlayCount: { $avg: '$playCount' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};