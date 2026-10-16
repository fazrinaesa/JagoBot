import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/rbacMiddleware';
import {
    getOverview,
    listUsers,
    updateUserRole,
    updateUserStatus,
    getMe,
} from '../controllers/adminController';

const router = Router();

// Semua route di sini WAJIB login + peran SUPER_ADMIN.
router.use(verifyToken, requireSuperAdmin);

// ─── Ringkasan & identitas ───
router.get('/overview', getOverview);
router.get('/me', getMe);

// ─── Kelola pengguna ───
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

export default router;
