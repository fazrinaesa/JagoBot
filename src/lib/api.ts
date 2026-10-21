import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// @ts-ignore
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

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

export const getAnalyticsStats = (botId: number, period: string = 'bulan') => {
    return api.get(`/dashboard/analytics?botId=${botId}&period=${period}`);
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

export const getUserBots = async () => {
    const response = await api.get('/dashboard/user-bots');
    return response.data?.data ?? response.data;
};

export const createProject = (nama_bot: string) => {
    console.log("📤 [API] Sending POST /dashboard/create-bot with nama_bot:", nama_bot);
    return api.post('/dashboard/create-bot', { nama_bot })
        .then(response => {
            console.log("📥 [API] Received response from /dashboard/create-bot:", response);
            return response;
        })
        .catch(error => {
            console.error("❌ [API] Error from /dashboard/create-bot:", error);
            throw error;
        });
};

/**
 * 6. User Profile APIs
 */
export const getUserProfile = () => {
    return api.get('/user/profile');
};

export const updateUserProfile = (data: {
    nama_lengkap?: string;
    email?: string;
    nama_toko?: string;
    whatsapp?: string;
    alamat?: string;
}) => {
    return api.put('/user/profile', data);
};

export const uploadAvatar = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/user/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteUserAccount = () => {
    return api.delete('/user/account');
};

/**
 * 7. Payment & Subscription APIs
 */
export const getMySubscription = () => {
    return api.get('/payment/subscription');
};

export const getMyPaymentProofs = () => {
    return api.get('/payment/proofs');
};

export const getTokenQuota = () => {
    return api.get('/payment/quota');
};

export const submitPaymentProof = (formData: FormData) => {
    return api.post('/payment/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Admin payment APIs
export const adminGetPaymentProofs = (status?: string) => {
    const url = status ? `/payment/admin/proofs?status=${status}` : '/payment/admin/proofs';
    return api.get(url);
};

export const adminReviewPayment = (proofId: number, action: 'approve' | 'reject', adminNote?: string) => {
    return api.post('/payment/admin/review', { proofId, action, adminNote });
};

export const adminGetSubscriptions = () => {
    return api.get('/payment/admin/subscriptions');
};

// ─── Admin: konfigurasi AI (Fase 2) ───
export interface AiProvider {
    id: number;
    label: string;
    provider: 'gemini' | 'openai-compatible';
    baseUrl: string | null;
    model: string;
    priority: number;
    isActive: boolean;
    maxTokens: number | null;
    temperature: number | null;
    lastStatus: 'ok' | 'error' | null;
    lastCheckedAt: string | null;
    createdAt: string;
    apiKeyMasked: string;
    hasKey: boolean;
}

export const adminGetAiProviders = () => api.get('/admin/ai/providers');

export const adminCreateAiProvider = (payload: {
    label: string;
    provider: 'gemini' | 'openai-compatible';
    baseUrl?: string;
    apiKey: string;
    model: string;
    priority?: number;
    maxTokens?: number;
    temperature?: number;
}) => api.post('/admin/ai/providers', payload);

export const adminUpdateAiProvider = (id: number, payload: Partial<{
    label: string;
    provider: 'gemini' | 'openai-compatible';
    baseUrl: string;
    apiKey: string;
    model: string;
    priority: number;
    isActive: boolean;
    maxTokens: number;
    temperature: number;
}>) => api.put(`/admin/ai/providers/${id}`, payload);

export const adminDeleteAiProvider = (id: number) => api.delete(`/admin/ai/providers/${id}`);

export const adminReorderAiProviders = (order: number[]) => api.put('/admin/ai/providers/reorder', { order });

export const adminTestAiProvider = (id: number) => api.post(`/admin/ai/providers/${id}/test`);

// ─── Admin: monitoring pemakaian API (Fase 4) ───
export interface UsageSummaryRow {
    userId: number;
    email: string;
    nama_toko: string;
    role: string;
    totalBots: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
    hasSubscription: boolean;
    planType: string | null;
    dailyTokenQuota: number;
    tokensUsedToday: number;
    remainingToday: number;
    quotaPercentUsed: number;
    endDate: string | null;
}

export const adminGetUsageSummary = (days = 30) => api.get(`/admin/api-usage/summary?days=${days}`);
export const adminGetUsageTimeline = (days = 30) => api.get(`/admin/api-usage/timeline?days=${days}`);
export const adminGetUsageLogs = (limit = 50, userId?: number) =>
    api.get(`/admin/api-usage/logs?limit=${limit}${userId ? `&userId=${userId}` : ''}`);
export const adminGetUsageByModel = (days = 30) => api.get(`/admin/api-usage/models?days=${days}`);

// ─── Admin: analitik pertanyaan global (Fase 5) ───
export interface TopQuestion {
    question: string;
    count: number;
    botCount: number;
    storeCount: number;
    lastAsked: string;
}

export interface UnansweredQuestion {
    question: string;
    count: number;
    reason: 'jawaban_kosong' | 'tidak_ditemukan';
    storeCount: number;
    lastAsked: string;
}

export const adminGetOverview = () => api.get('/admin/overview');
export const adminGetAnalyticsOverview = (days = 30) => api.get(`/admin/analytics/overview?days=${days}`);
export const adminGetTopQuestions = (days = 30, limit = 20) =>
    api.get(`/admin/analytics/top-questions?days=${days}&limit=${limit}`);
export const adminGetUnanswered = (days = 30, limit = 20) =>
    api.get(`/admin/analytics/unanswered?days=${days}&limit=${limit}`);

// ─── Admin: manajemen pengguna (Fase 6) ───
export interface AdminUser {
    id: number;
    nama_toko: string;
    email: string;
    nama_lengkap: string | null;
    role: 'USER' | 'SUPER_ADMIN';
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    totalBots: number;
}

export const adminGetUsers = (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
};

export const adminUpdateUserRole = (id: number, role: AdminUser['role']) =>
    api.patch(`/admin/users/${id}/role`, { role });

export const adminUpdateUserStatus = (id: number, isActive: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isActive });

export const getTelegramConnection = (botId: number) => api.get(`/telegram/connections/${botId}`);
export const connectTelegram = (botId: number, token: string) => api.post('/telegram/connections', { botId, token });
export const disconnectTelegram = (botId: number) => api.delete(`/telegram/connections/${botId}`);

export default api;