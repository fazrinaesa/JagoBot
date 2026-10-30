import './src/lib/env';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes';
import dotenv from 'dotenv';
import dashboardRoutes from './src/routes/dashboardRoutes';
import chatRoutes from './src/routes/chatRoutes'; // <-- TAMBAHKA
import knowledgeRoutes from './src/routes/knowledgeRoutes';
import botRoutes from './src/routes/botRoutes';
import userRoutes from './src/routes/userRoutes';
import integrasiRoutes from './src/routes/integrasiRoutes';
import paymentRoutes from './src/routes/paymentRoutes';
import sheetsRoutes from './src/routes/sheetsRoutes';
import telegramRoutes from './src/routes/telegramRoutes';
import adminRoutes from './src/routes/adminRoutes';
import { startSheetPolling } from './src/lib/googleSheets';

console.log("DEBUG API KEY:", process.env.GEMINI_API_KEY ? "ADA ✅" : "KOSONG ❌");
console.log("DEBUG SUPABASE URL:", process.env.SUPABASE_URL ? "ADA ✅" : "KOSONG ❌");
console.log("Starting server..."); // Trigger restart
const app = express();

// =======================================================
// PENYESUAIAN LANGKAH 3: MENYAJIKAN FILE STATIS (PUBLIC)
// =======================================================
const backendDir = __dirname;
app.use(express.static(path.join(backendDir, 'public')));
// Anchor uploads to this backend, independent of the process working directory.
app.use('/uploads', express.static(path.join(backendDir, 'uploads')));

const allowedOrigins = [
    'http://localhost:5177',
    'http://localhost:5000',
    'https://jagobot.jagoai.dev',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
];

app.use(cors({
    origin: (origin, callback) => {
        // Tanpa Origin (curl, health check, same-origin) selalu diizinkan.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pintu utama API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/user', userRoutes);
app.use('/api/public', integrasiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Untuk development local
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server JagoBot jalan di http://localhost:${PORT}`);
    // Start Google Sheets polling if GOOGLE_CLIENT_ID is configured
    if (process.env.GOOGLE_CLIENT_ID) {
        startSheetPolling();
    } else {
        console.log('[Sheets] Google Sheets integration disabled (GOOGLE_CLIENT_ID not set)');
    }
});

// Produksi: sajikan hasil build frontend dari folder dist di root repo (satu domain).
// Didaftarkan setelah API agar /api/* tidak tertangkap fallback SPA.
const frontendDist = path.join(__dirname, '../dist');
if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
    app.use(express.static(frontendDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
    console.log(`[Static] Frontend disajikan dari ${frontendDist}`);
} else {
    console.log('[Static] dist frontend belum ada — jalankan "npm run build" di root repo.');
}

export default app;