import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: GET /api/dashboard/stats
router.get('/stats', verifyToken, getDashboardStats);

// Endpoint: GET /api/dashboard/active-bot
import { getActiveBot } from '../controllers/dashboard.controller';
router.get('/active-bot', verifyToken, getActiveBot);

export default router;