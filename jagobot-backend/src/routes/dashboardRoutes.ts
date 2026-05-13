import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { verifyToken } from '../middleware/authMiddleware';
import { getActiveBot, getUserBots, createBot } from '../controllers/dashboard.controller';

const router = Router();

// Endpoint: GET /api/dashboard/stats
router.get('/stats', verifyToken, getDashboardStats);

// Endpoint: GET /api/dashboard/active-bot
router.get('/active-bot', verifyToken, getActiveBot);

// Endpoint: GET /api/dashboard/user-bots
router.get('/user-bots', verifyToken, getUserBots);

// Endpoint: POST /api/dashboard/create-bot
router.post('/create-bot', verifyToken, createBot);

export default router;