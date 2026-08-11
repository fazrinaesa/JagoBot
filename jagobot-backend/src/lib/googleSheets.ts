/**
 * Google Sheets integration — OAuth2 token encryption/decryption
 * and scheduled polling to sync spreadsheet data into knowledge base.
 */

import { google, sheets_v4 } from 'googleapis';
import CryptoJS from 'crypto-js';
import prisma from './prisma';
import { generateEmbedding } from './llm';

const ENCRYPTION_KEY = process.env.SHEETS_ENCRYPTION_KEY || 'jagobot-default-key-change-in-production';

// ─── Encryption helpers ───

const encrypt = (text: string): string => CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
const decrypt = (cipher: string): string => CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

// ─── Google OAuth2 client factory ───

const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sheets/callback';

    if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

// ─── Generate OAuth URL ───

export const getGoogleAuthUrl = (botId: number): string => {
    const oauth2Client = getOAuth2Client();
    const state = JSON.stringify({ botId }); // Pass botId through OAuth state param

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        state,
    });
};

// ─── Handle OAuth callback — store tokens ───

export const handleOAuthCallback = async (code: string, state: string) => {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { botId } = JSON.parse(state);

    // Check if connection already exists
    const existing = await prisma.googleSheetsConnection.findFirst({
        where: { botId: Number(botId) }
    });

    if (existing) {
        // Update existing connection
        await prisma.googleSheetsConnection.update({
            where: { id: existing.id },
            data: {
                oauthToken: encrypt(JSON.stringify(tokens)),
                refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : existing.refreshToken,
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            }
        });
    }

    return { botId, tokens };
};

// ─── Refresh expired token ───

const refreshAccessToken = async (connection: any) => {
    const oauth2Client = getOAuth2Client();
    const refreshToken = decrypt(connection.refreshToken);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    await prisma.googleSheetsConnection.update({
        where: { id: connection.id },
        data: {
            oauthToken: encrypt(JSON.stringify(credentials)),
            tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        }
    });

    return oauth2Client;
};

// ─── Get authenticated sheets client for a bot ───

const getSheetsClient = async (botId: number): Promise<{ sheets: sheets_v4.Sheets; connection: any }> => {
    const connection = await prisma.googleSheetsConnection.findFirst({
        where: { botId: Number(botId), isActive: true }
    });

    if (!connection) {
        throw new Error(`No active Google Sheets connection for bot ${botId}`);
    }

    const oauth2Client = getOAuth2Client();

    // Check if token expired
    if (connection.tokenExpiry && connection.tokenExpiry < new Date()) {
        const refreshed = await refreshAccessToken(connection);
        return { sheets: google.sheets({ version: 'v4', auth: refreshed }), connection };
    }

    const token = JSON.parse(decrypt(connection.oauthToken));
    oauth2Client.setCredentials(token);

    return { sheets: google.sheets({ version: 'v4', auth: oauth2Client }), connection };
};

// ─── Poll spreadsheet and sync to knowledge base ───

export const syncSheetToKnowledgeBase = async (botId: number): Promise<{ rows: number; updated: boolean }> => {
    const { sheets, connection } = await getSheetsClient(botId);

    // Read all data from the sheet
    const range = `${connection.sheetName}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: connection.spreadsheetId,
        range,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
        return { rows: 0, updated: false };
    }

    // Convert rows to text content (header + data rows)
    const headers = rows[0];
    const contentParts: string[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowText = headers.map((h: string, idx: number) => `${h}: ${row[idx] || ''}`).join(' | ');
        contentParts.push(rowText);
    }

    const fullContent = contentParts.join('\n');
    const sourceName = `Google Sheets: ${connection.spreadsheetId}`;

    // Check if knowledge base entry exists for this sheet
    let kb = await prisma.knowledgeBase.findFirst({
        where: { botId: Number(botId), nama_sumber: sourceName }
    });

    if (kb) {
        // Update existing — delete old chunks and re-embed
        await prisma.documentChunk.deleteMany({ where: { knowledgeBaseId: kb.id } });

        // Chunk and embed
        const chunks = chunkText(fullContent, 1000);
        for (const chunk of chunks) {
            const vector = await generateEmbedding(chunk);
            const vectorString = `[${vector.join(',')}]`;
            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
                VALUES (${kb.id}, ${chunk}, ${vectorString}::vector)
            `;
        }

        await prisma.knowledgeBase.update({
            where: { id: kb.id },
            data: {
                isi_teks: fullContent,
                status: 'ready',
            }
        });

        // Update last synced timestamp
        await prisma.googleSheetsConnection.update({
            where: { id: connection.id },
            data: { lastSyncedAt: new Date() }
        });

        return { rows: rows.length, updated: true };
    } else {
        // Create new knowledge base entry
        kb = await prisma.knowledgeBase.create({
            data: {
                botId: Number(botId),
                nama_sumber: sourceName,
                isi_teks: fullContent,
                tipe_sumber: 'google_sheets',
                status: 'ready',
            }
        });

        // Chunk and embed
        const chunks = chunkText(fullContent, 1000);
        for (const chunk of chunks) {
            const vector = await generateEmbedding(chunk);
            const vectorString = `[${vector.join(',')}]`;
            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
                VALUES (${kb.id}, ${chunk}, ${vectorString}::vector)
            `;
        }

        await prisma.googleSheetsConnection.update({
            where: { id: connection.id },
            data: { lastSyncedAt: new Date() }
        });

        return { rows: rows.length, updated: false };
    }
};

// ─── Simple text chunking ───

const chunkText = (text: string, maxLen: number): string[] => {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?।])\s+/);
    let current = '';

    for (const sentence of sentences) {
        if ((current + sentence).length > maxLen && current.length > 0) {
            chunks.push(current.trim());
            current = sentence;
        } else {
            current += (current ? ' ' : '') + sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());

    // Handle edge case: very long sentences
    return chunks.flatMap(c => {
        if (c.length > maxLen * 2) {
            const parts: string[] = [];
            for (let i = 0; i < c.length; i += maxLen) {
                parts.push(c.slice(i, i + maxLen));
            }
            return parts;
        }
        return [c];
    });
};

// ─── Scheduled polling (runs every N minutes per connection) ───

let pollingInterval: NodeJS.Timeout | null = null;

export const startSheetPolling = () => {
    if (pollingInterval) return; // Already running

    console.log('[Sheets] Starting scheduled polling');

    const poll = async () => {
        try {
            const connections = await prisma.googleSheetsConnection.findMany({
                where: { isActive: true }
            });

            for (const conn of connections) {
                const now = new Date();
                const lastSync = conn.lastSyncedAt || new Date(0);
                const minutesSinceSync = (now.getTime() - lastSync.getTime()) / 60000;

                if (minutesSinceSync >= conn.pollIntervalMin) {
                    console.log(`[Sheets] Syncing bot ${conn.botId} (spreadsheet: ${conn.spreadsheetId})`);
                    try {
                        const result = await syncSheetToKnowledgeBase(conn.botId);
                        console.log(`[Sheets] Bot ${conn.botId}: ${result.rows} rows, updated: ${result.updated}`);
                    } catch (err: any) {
                        console.error(`[Sheets] Error syncing bot ${conn.botId}:`, err.message);
                    }
                }
            }
        } catch (err) {
            console.error('[Sheets] Polling error:', err);
        }
    };

    // Run immediately, then every 5 minutes
    poll();
    pollingInterval = setInterval(poll, 5 * 60 * 1000);
};

export const stopSheetPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('[Sheets] Stopped polling');
    }
};
