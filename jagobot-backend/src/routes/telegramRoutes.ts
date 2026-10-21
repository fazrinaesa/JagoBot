import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { connectTelegram, disconnectTelegram, getTelegramConnection, handleTelegramWebhook, telegramWebhookReady } from '../controllers/telegramController';

const router = Router();
router.post('/connections', verifyToken, connectTelegram);
router.get('/connections/:botId', verifyToken, getTelegramConnection);
router.delete('/connections/:botId', verifyToken, disconnectTelegram);
router.get('/webhook-ready', telegramWebhookReady);
router.post('/webhook/:connectionId', handleTelegramWebhook);
export default router;
