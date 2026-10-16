import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/rbacMiddleware';
import { uploadProof } from '../middleware/upload';
import {
    getMySubscription,
    submitPaymentProof,
    getMyPaymentProofs,
    checkTokenQuota,
    adminListPaymentProofs,
    adminReviewPayment,
    adminListSubscriptions
} from '../controllers/paymentController';

const router = Router();

// ─── User routes (require auth) ───
router.get('/subscription', verifyToken, getMySubscription);
router.get('/proofs', verifyToken, getMyPaymentProofs);
router.get('/quota', verifyToken, checkTokenQuota);
router.post('/submit', verifyToken, uploadProof, submitPaymentProof);

// ─── Admin routes (require auth + peran ADMIN/SUPER_ADMIN) ───
// Sebelumnya hanya verifyToken → user biasa bisa melihat data semua orang. Kini ditutup.
router.get('/admin/proofs', verifyToken, requireAdmin, adminListPaymentProofs);
router.post('/admin/review', verifyToken, requireAdmin, adminReviewPayment);
router.get('/admin/subscriptions', verifyToken, requireAdmin, adminListSubscriptions);

export default router;
