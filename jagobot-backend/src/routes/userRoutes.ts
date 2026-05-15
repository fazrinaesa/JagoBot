import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/authMiddleware';
import { getProfile, updateProfile, uploadAvatar, deleteAccount } from '../controllers/userController';
import { uploadImage } from '../middleware/upload';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// ✅ Tambah error handler khusus untuk route avatar
router.post('/avatar', verifyToken, (req, res, next) => {
    uploadImage.single('file')(req, res, (err) => {
        if (err) {
            console.error("MULTER ERROR:", err);
            return res.status(400).json({ message: err.message });
        }
        console.log("✅ MULTER SELESAI, FILE:", req.file); // tambah ini
        next();
    });
}, uploadAvatar);

router.delete('/account', verifyToken, deleteAccount);

export default router;