import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/rbacMiddleware';
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

// ─── Verifikasi pembayaran: hanya SUPER_ADMIN ───
// User biasa hanya boleh melihat/mengirim bukti pembayarannya sendiri.
router.get('/admin/proofs', verifyToken, requireSuperAdmin, adminListPaymentProofs);
router.post('/admin/review', verifyToken, requireSuperAdmin, adminReviewPayment);
router.get('/admin/subscriptions', verifyToken, requireSuperAdmin, adminListSubscriptions);

export default router;
