import { Router } from 'express';
import { handleIncomingChat } from '../controllers/chatController';

const router = Router();

// Endpoint: POST /api/chat/send
// Route ini sekarang akan memproses pesan menggunakan alur RAG (Embedding + Retrieval)
router.post('/send', handleIncomingChat);

export default router;