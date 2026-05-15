import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { getProfile, updateProfile, uploadAvatar, deleteAccount } from '../controllers/userController';
import { uploadImage } from '../middleware/upload';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, uploadImage.single('file'), uploadAvatar);
router.delete('/account', verifyToken, deleteAccount);

export default router;
