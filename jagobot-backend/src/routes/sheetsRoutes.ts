import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import {
    getAuthUrl,
    oauthCallback,
    saveConnection,
    getConnection,
    manualSync,
    disconnect,
} from '../controllers/sheetsController';

const router = Router();

// Public callback (Google redirects here after OAuth)
router.get('/callback', oauthCallback);

// Authenticated routes
router.post('/auth-url', verifyToken, getAuthUrl);
router.post('/save', verifyToken, saveConnection);
router.get('/connection', verifyToken, getConnection);
router.post('/sync', verifyToken, manualSync);
router.post('/disconnect', verifyToken, disconnect);

export default router;
