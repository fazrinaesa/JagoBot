import { Router } from 'express';
import { handleIncomingChat } from '../controllers/chatController';
import { verifyToken } from '../middleware/authMiddleware';
import { enforceTokenQuota } from '../middleware/quotaMiddleware';

const router = Router();

// Endpoint: POST /api/chat/send
// Route ini sekarang akan memproses pesan menggunakan alur RAG (Embedding + Retrieval)
// Quota middleware checks daily token limit before processing
router.post('/send', verifyToken, enforceTokenQuota, handleIncomingChat);

export default router;