import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token) {
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
    return api.get(`/dashboard/stats?botId=${botId}&period=${period}`);
};

export const getActiveBot = (botId?: number) => {
    const url = botId ? `/dashboard/active-bot?botId=${botId}` : '/dashboard/active-bot';
    return api.get(url);
};

/**
 * 5.1 Connect Personality Tab
 * Mengupdate Profil Bot dan instruksi khusus
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
 * 5.2.1 Upload file (PDF/DOCX) ke Knowledge Base
 * Menggunakan FormData karena mengirim file binary
 */
export const uploadKnowledgeBaseFile = (botId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('botId', String(botId));

    return api.post('/knowledge/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * 5.2.2 Ingest teks manual ke Knowledge Base
 * Menyimpan atau memperbarui informasi manual berdasarkan title (upsert)
 */
export const ingestManualText = (botId: number, title: string, content: string) => {
    return api.post('/knowledge/manual', {
        botId,
        title,
        content,
    });
};

/**
 * 5.2.3 Ambil single Knowledge Base berdasarkan ID
 */
export const getKnowledgeBaseById = (id: number) => {
    return api.get(`/knowledge/${id}`);
};

/**
 * 5.2.4 Update Knowledge Base (manual text) berdasarkan ID
 * Memperbarui title, content, dan re-generate embedding-nya
 */
export const updateKnowledgeBase = (id: number, title: string, content: string) => {
    return api.put(`/knowledge/${id}`, {
        title,
        content,
    });
};

/**
 * 5.2.5 Hapus Knowledge Base berdasarkan ID
 * Menghapus dokumen beserta semua chunk dan embedding terkait
 */
export const deleteKnowledgeBase = (id: number) => {
    return api.delete(`/knowledge/${id}`);
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

export const getUserBots = () => {
    return api.get('/dashboard/user-bots');
};

export const createProject = (nama_bot: string) => {
    return api.post('/dashboard/create-bot', { nama_bot });
};

export default api;