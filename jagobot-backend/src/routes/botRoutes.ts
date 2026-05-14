import { Router } from 'express';
import { updateBotSettings, getBotProfile } from '../controllers/botController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: GET /api/bot/profile?botId=X (load data profil bot yang sudah tersimpan)
router.get('/profile', verifyToken, getBotProfile);

// Endpoint: PATCH /api/bot/settings (simpan personality & instructions)
router.patch('/settings', verifyToken, updateBotSettings);

export default router;