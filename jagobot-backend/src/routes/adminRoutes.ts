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
import {
    listProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    reorderProviders,
    testProvider,
} from '../controllers/aiConfigController';
import {
    getUsageSummary,
    getUsageTimeline,
    getUsageLogs,
    getUsageByModel,
} from '../controllers/apiUsageController';
import {
    getTopQuestions,
    getUnanswered,
    getAnalyticsOverview,
} from '../controllers/analyticsController';

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

// ─── Konfigurasi AI (Fase 2) ───
router.get('/ai/providers', listProviders);
router.post('/ai/providers', createProvider);
router.put('/ai/providers/reorder', reorderProviders); // harus di atas '/:id'
router.put('/ai/providers/:id', updateProvider);
router.delete('/ai/providers/:id', deleteProvider);
router.post('/ai/providers/:id/test', testProvider);

// ─── Monitoring pemakaian API (Fase 4) ───
router.get('/api-usage/summary', getUsageSummary);
router.get('/api-usage/timeline', getUsageTimeline);
router.get('/api-usage/logs', getUsageLogs);
router.get('/api-usage/models', getUsageByModel);

// ─── Analitik pertanyaan global (Fase 5) ───
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/top-questions', getTopQuestions);
router.get('/analytics/unanswered', getUnanswered);

export default router;
