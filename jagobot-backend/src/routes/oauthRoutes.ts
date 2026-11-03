import { Router } from 'express';
import { oauthStart, oauthCallback } from '../controllers/oauthController';

const router = Router();

// Login OAuth: /api/auth/oauth/:provider/start dan /callback
router.get('/:provider/start', oauthStart);
router.get('/:provider/callback', oauthCallback);

export default router;
