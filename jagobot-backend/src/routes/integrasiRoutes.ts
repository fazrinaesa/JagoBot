import { Router } from 'express';
import { handlePublicChat } from '../controllers/integrasiController';

const router = Router();

// Jalur ini TIDAK menggunakan middleware authenticateToken agar bisa diakses oleh widget dari luar
router.post('/chat', handlePublicChat);

export default router;