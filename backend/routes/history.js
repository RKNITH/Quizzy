import { Router } from 'express';
import {
    getMyHistory,
    getHistoryDetail,
    getAISuggestion,
    deleteHistory,
} from '../controllers/historyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All history routes require authentication
router.use(authenticate);

router.get('/', getMyHistory);
router.get('/:id', getHistoryDetail);
router.post('/:id/suggestion', getAISuggestion);
router.delete('/:id', deleteHistory);

export default router;