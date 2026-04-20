import { Router } from 'express';
import { updateBotSettings } from '../controllers/botController';

const router = Router();

// Endpoint: PATCH /api/bot/settings
router.patch('/settings', updateBotSettings);

export default router;