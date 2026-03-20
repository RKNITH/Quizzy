import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0], errors: messages });
    }
    next(error);
  }
};

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username max 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Room schemas
export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50),
    quizId: z.string().min(1, 'Quiz ID is required'),
    maxParticipants: z.number().min(2).max(50).optional(),
    settings: z
      .object({
        allowPowerUps: z.boolean().optional(),
        showLeaderboard: z.boolean().optional(),
        antiCheat: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const joinRoomSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Room code must be 6 characters'),
  }),
});

// Quiz schemas
export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    category: z.enum(['Math', 'GK', 'Coding', 'Science', 'History', 'Sports', 'AI-Generated']),
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    timePerQuestion: z.number().min(10).max(120).optional(),
    questions: z
      .array(
        z.object({
          question: z.string().min(5),
          options: z.array(z.string().min(1)).length(4, 'Must have exactly 4 options'),
          correctAnswer: z.number().min(0).max(3),
          explanation: z.string().optional(),
          difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
          points: z.number().min(50).max(500).optional(),
        })
      )
      .min(3, 'Quiz must have at least 3 questions')
      .max(20),
  }),
});

export const aiQuizSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(100),
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    numQuestions: z.number().min(3).max(15).optional(),
  }),
});

// Answer schema
export const submitAnswerSchema = z.object({
  body: z.object({
    questionIndex: z.number().min(0),
    selectedOption: z.number().min(0).max(3),
    timeTaken: z.number().min(0),
    usedDoubleScore: z.boolean().optional(),
  }),
  params: z.object({ roomId: z.string() }),
});
