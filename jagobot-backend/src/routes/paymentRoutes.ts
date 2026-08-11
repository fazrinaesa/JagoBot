import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
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

// ─── Admin routes (require auth — admin check should be added per your RBAC) ───
router.get('/admin/proofs', verifyToken, adminListPaymentProofs);
router.post('/admin/review', verifyToken, adminReviewPayment);
router.get('/admin/subscriptions', verifyToken, adminListSubscriptions);

export default router;
