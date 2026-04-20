import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Gunakan cara manual untuk mengambil base URL agar TS tidak bingung dengan import.meta
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token) {
            // Memastikan headers ada, jika tidak buat instance baru
            if (!config.headers) {
                config.headers = new AxiosHeaders();
            }
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getDashboardStats = (botId: number, period: string = 'bulan') => {
    // Menambahkan ?botId= dan ?period= agar backend bisa menangkapnya via req.query
    return api.get(`/dashboard/stats?botId=${botId}&period=${period}`);
};

export const getActiveBot = (botId?: number) => {
    const url = botId ? `/dashboard/active-bot?botId=${botId}` : '/dashboard/active-bot';
    return api.get(url);
};

// --- TAMBAHAN BARU UNTUK INTEGRASI LANGKAH 5 ---

/**
 * 5.1 Connect Personality Tab
 * Mengupdate kepribadian dan instruksi khusus bot
 */
export const updateBotSettings = (botId: number, personality: string, instructions: string) => {
    return api.patch('/bot/settings', {
        botId,
        personality,
        instructions
    });
};

/**
 * 5.2 Connect Knowledge Base
 * Mengambil daftar file yang sudah terupload berdasarkan botId
 */
export const getKnowledgeBaseList = (botId: number) => {
    return api.get(`/knowledge/list?botId=${botId}`);
};

/**
 * 5.3 Playground Live Chat
 * Mengirim pesan ke AI dan mendapatkan jawaban
 */
export const sendChat = (botId: number, customerName: string, message: string) => {
    return api.post('/chat/send', {
        botId,
        customerName,
        message
    });
};

export default api;