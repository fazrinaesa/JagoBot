/**
 * Unified LLM provider layer — 9router primary, Gemini fallback.
 *
 * Architecture:
 * - Chat completions: 9router (OpenAI-compatible) → fallback to Gemini on error/429/timeout
 * - Embeddings: 9router /embeddings endpoint if available → fallback to Gemini embedding API
 * - The embedding dimension MUST be consistent across all DocumentChunk rows.
 *   If you switch embedding models, you must regenerate ALL existing vectors.
 *
 * Env vars:
 *   NINEROUTER_BASE_URL  — e.g. https://your-9router.com/v1
 *   NINEROUTER_API_KEY   — API key for 9router
 *   NINEROUTER_CHAT_MODEL — model name for chat (default: first available)
 *   NINEROUTER_EMBED_MODEL — model name for embeddings (default: text-embedding-3-small)
 *   GEMINI_API_KEY        — fallback key for Gemini (kept for backward compat)
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── 9router OpenAI-compatible client ───
const nineRouterUrl = process.env.NINEROUTER_BASE_URL;
const nineRouterKey = process.env.NINEROUTER_API_KEY;

let nineRouter: OpenAI | null = null;
if (nineRouterUrl && nineRouterKey) {
    nineRouter = new OpenAI({
        baseURL: nineRouterUrl,
        apiKey: nineRouterKey,
        timeout: 30000,
        maxRetries: 0, // We handle retries manually with fallback
    });
}

// ─── Gemini fallback client ───
const geminiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (geminiKey) {
    genAI = new GoogleGenerativeAI(geminiKey);
}

const CHAT_MODEL = process.env.NINEROUTER_CHAT_MODEL || '';
const EMBED_MODEL = process.env.NINEROUTER_EMBED_MODEL || 'text-embedding-3-small';
const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';
const GEMINI_EMBED_MODEL = 'gemini-embedding-001';

// ─── Helpers ───

const isRetryableError = (err: any): boolean => {
    const msg = err?.message || '';
    const status = err?.status || err?.statusCode;
    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        msg.includes('rate limit') ||
        msg.includes('timeout') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('ECONNRESET')
    );
};

// ─── Chat Completions ───

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatOptions {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
}

export const generateChatCompletion = async (opts: ChatOptions): Promise<string> => {
    // Try 9router first
    if (nineRouter) {
        try {
            const completion = await nineRouter.chat.completions.create({
                model: CHAT_MODEL,
                messages: opts.messages as any,
                temperature: opts.temperature ?? 0.4,
                max_tokens: opts.maxTokens,
            });
            const reply = completion.choices?.[0]?.message?.content;
            if (!reply) throw new Error('Empty response from 9router');
            return reply;
        } catch (err: any) {
            if (isRetryableError(err)) {
                console.warn(`⚠️ [LLM] 9router chat failed (${err.status || err.message}), falling back to Gemini`);
            } else {
                console.error(`❌ [LLM] 9router chat error (non-retryable): ${err.message}`);
                throw err;
            }
        }
    }

    // Fallback to Gemini
    if (!genAI) throw new Error('No LLM provider available. Set NINEROUTER_* or GEMINI_API_KEY.');

    const model = genAI.getGenerativeModel({ model: GEMINI_CHAT_MODEL });

    // Convert OpenAI-style messages to Gemini format
    const systemMsg = opts.messages.find(m => m.role === 'system');
    const userMsg = opts.messages.find(m => m.role === 'user');

    const prompt = userMsg?.content || '';
    const fullPrompt = systemMsg
        ? `${systemMsg.content}\n\nUSER: ${prompt}`
        : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error('Empty response from Gemini');
    return text;
};

// ─── Embeddings ───

/**
 * Generate embedding vector for a text string.
 * IMPORTANT: All DocumentChunk rows must use the SAME embedding model/dimension.
 * If you change EMBED_MODEL, you must regenerate ALL existing vectors.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    // Try 9router embeddings first
    if (nineRouter) {
        try {
            const embedding = await nineRouter.embeddings.create({
                model: EMBED_MODEL,
                input: text,
            });
            const values = embedding.data?.[0]?.embedding;
            if (!values || values.length === 0) throw new Error('Empty embedding from 9router');
            return values;
        } catch (err: any) {
            if (isRetryableError(err)) {
                console.warn(`⚠️ [LLM] 9router embedding failed (${err.status || err.message}), falling back to Gemini`);
            } else {
                // Non-retryable: 9router might not have embeddings endpoint
                console.warn(`⚠️ [LLM] 9router embeddings unavailable: ${err.message}. Using Gemini.`);
            }
        }
    }

    // Fallback to Gemini embeddings
    if (!geminiKey) throw new Error('No embedding provider available. Set NINEROUTER_* or GEMINI_API_KEY.');

    const modelName = GEMINI_EMBED_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${geminiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${modelName}`,
            content: { parts: [{ text }] }
        })
    });

    const data: any = await response.json();

    if (response.ok && data.embedding) {
        return data.embedding.values;
    } else {
        throw new Error(data.error?.message || 'Failed to generate embedding from Gemini');
    }
};

// ─── Health Check ───

export const llmHealthCheck = async (): Promise<{ chat: string; embedding: string }> => {
    const result = { chat: 'unknown', embedding: 'unknown' };

    // Test chat
    try {
        if (nineRouter) {
            await nineRouter.chat.completions.create({
                model: CHAT_MODEL,
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 5,
            });
            result.chat = '9router';
        } else {
            result.chat = 'gemini-only';
        }
    } catch {
        result.chat = '9router-failed';
    }

    // Test embeddings
    try {
        if (nineRouter) {
            const emb = await nineRouter.embeddings.create({
                model: EMBED_MODEL,
                input: 'test',
            });
            result.embedding = emb.data?.[0]?.embedding?.length ? '9router' : '9router-empty';
        } else {
            result.embedding = 'gemini-only';
        }
    } catch {
        result.embedding = '9router-failed';
    }

    return result;
};
