import express from 'express';
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
import { startSheetPolling } from './src/lib/googleSheets';

dotenv.config();
console.log("DEBUG API KEY:", process.env.GEMINI_API_KEY ? "ADA ✅" : "KOSONG ❌");
dotenv.config();
// Tambahkan baris ini untuk cek kunci Supabase
console.log("DEBUG SUPABASE URL:", process.env.SUPABASE_URL ? "ADA ✅" : "KOSONG ❌");
console.log("DEBUG SUPABASE KEY:", process.env.SUPABASE_ANON_KEY ? "ADA ✅" : "KOSONG ❌");
console.log("Starting server..."); // Trigger restart
const app = express();

// =======================================================
// PENYESUAIAN LANGKAH 3: MENYAJIKAN FILE STATIS (PUBLIC)
// =======================================================
app.use(express.static('public'));
// Serve uploaded files (payment proofs, etc.) — path matches /uploads/...
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: '*', // Mengizinkan semua website luar mengakses endpoint backend kamu
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
app.use('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Untuk development local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => {
        console.log(`🚀 Server JagoBot jalan di http://localhost:${PORT}`);
        // Start Google Sheets polling if GOOGLE_CLIENT_ID is configured
        if (process.env.GOOGLE_CLIENT_ID) {
            startSheetPolling();
        } else {
            console.log('[Sheets] Google Sheets integration disabled (GOOGLE_CLIENT_ID not set)');
        }
    });
}

export default app;