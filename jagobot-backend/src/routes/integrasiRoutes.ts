import { Router } from 'express';
import { handlePublicChat } from '../controllers/integrasiController';
import { requireActiveBotSubscription } from '../middleware/subscriptionMiddleware';
import { enforceTokenQuota } from '../middleware/quotaMiddleware';

const router = Router();

// Jalur ini TIDAK menggunakan middleware authenticateToken agar bisa diakses oleh widget dari luar
router.post('/chat', requireActiveBotSubscription, enforceTokenQuota, handlePublicChat);

export default router;