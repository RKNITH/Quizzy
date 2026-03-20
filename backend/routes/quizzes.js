import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  generateAIQuizHandler,
  seedQuizzesHandler,
  getCategories,
} from '../../controllers/quizController.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { validate, createQuizSchema, aiQuizSchema } from '../../middleware/validate.js';

const router = Router();

router.get('/', optionalAuth, getQuizzes);
router.get('/categories', getCategories);
router.get('/seed', seedQuizzesHandler);
router.get('/:id', optionalAuth, getQuizById);
router.post('/', authenticate, validate(createQuizSchema), createQuiz);
router.post('/ai/generate', authenticate, validate(aiQuizSchema), generateAIQuizHandler);

export default router;
