import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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
export const uploadImage = multer({ storage, fileFilter: imageFileFilter });