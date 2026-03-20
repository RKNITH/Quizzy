import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  getRoomById,
  startGame,
  submitAnswer,
  skipQuestion,
  finishGame,
  getLeaderboard,
  getGlobalLeaderboard,
} from '../../controllers/roomController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate, createRoomSchema, joinRoomSchema, submitAnswerSchema } from '../../middleware/validate.js';

const router = Router();

router.get('/leaderboard/global', getGlobalLeaderboard);
router.post('/', authenticate, validate(createRoomSchema), createRoom);
router.post('/join', authenticate, validate(joinRoomSchema), joinRoom);
router.get('/:id', authenticate, getRoomById);
router.post('/:id/start', authenticate, startGame);
router.post('/:id/finish', authenticate, finishGame);
router.get('/:id/leaderboard', authenticate, getLeaderboard);
router.post('/:roomId/answer', authenticate, validate(submitAnswerSchema), submitAnswer);
router.post('/:roomId/skip', authenticate, skipQuestion);

export default router;
