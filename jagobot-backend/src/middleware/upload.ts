import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Path absolut ke folder uploads
const uploadDir = path.join(__dirname, '../../uploads');

// Auto-create folder kalau belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ PERUBAHAN: Ganti diskStorage ke memoryStorage agar kompatibel dengan Vercel
const storage = multer.memoryStorage();

// ✅ TAMBAH INI
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format tidak didukung. Gunakan PDF atau DOCX saja.'), false);
    }
};

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.'), false);
    }
}

// ✅ TAMBAH fileFilter ke multer
export const upload = multer({ storage, fileFilter });

// ✅ uploadImage pakai memoryStorage agar file.buffer tersedia langsung tanpa tulis ke disk
export const uploadImage = multer({ storage: multer.memoryStorage(), fileFilter: imageFileFilter });

// Payment proof upload — saves to disk for self-hosted deployment
const proofStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/proofs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `proof_${Date.now()}${ext}`);
    }
});

export const uploadProof = multer({ storage: proofStorage, fileFilter: imageFileFilter }).single('proof');