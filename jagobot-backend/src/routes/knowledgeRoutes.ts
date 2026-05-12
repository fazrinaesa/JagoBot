import { Router } from 'express';
import { ingestPDF, getKnowledgeBaseList, deleteKnowledgeBase, ingestManualText, getKnowledgeBaseById, updateKnowledgeBase } from '../controllers/knowledgeController';
import { upload } from '../middleware/upload';

const router = Router();

// 1. Upload file (PDF/DOCX) dan proses ke Vector DB
router.post('/upload', upload.single('file'), ingestPDF);

// 2. Ambil daftar file yang sudah terupload (GET /api/knowledge/list?botId=...)
router.get('/list', getKnowledgeBaseList);

// 4. Ingest Manual Text (Sekarang mendukung Update/Edit dengan logic Upsert)
// Endpoint: POST /api/knowledge/manual
router.post('/manual', ingestManualText);

// 2.5. Ambil single knowledge base by ID (GET /api/knowledge/:id)
router.get('/:id', getKnowledgeBaseById);

// 3. Tambahan: Hapus file dari database dan Vector DB
// Endpoint: DELETE /api/knowledge/:id
router.delete('/:id', deleteKnowledgeBase);

// 3.5. Update knowledge base (PUT /api/knowledge/:id)
router.put('/:id', updateKnowledgeBase);



export default router;