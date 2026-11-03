/**
 * Login OAuth: Google & GitHub.
 *
 * Alur: /start -> provider -> /callback -> cari/buat user -> token JWT yang
 * sama bentuknya dengan login biasa -> redirect ke frontend.
 *
 * Tidak mengubah alur login email/password yang sudah berjalan; berkas ini
 * hanya menambah jalur masuk alternatif.
 */
import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

type Provider = 'google' | 'github';

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5177').replace(/\/$/, '');
const baseUrl = () => (process.env.OAUTH_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const callbackUrl = (provider: Provider) => `${baseUrl()}/api/auth/oauth/${provider}/callback`;

const credentials = (provider: Provider) => {
    const id = provider === 'google' ? process.env.GOOGLE_OAUTH_CLIENT_ID : process.env.GITHUB_OAUTH_CLIENT_ID;
    const secret = provider === 'google' ? process.env.GOOGLE_OAUTH_CLIENT_SECRET : process.env.GITHUB_OAUTH_CLIENT_SECRET;
    return { id: (id || '').trim(), secret: (secret || '').trim(), ready: Boolean(id && secret) };
};

const fail = (res: Response, provider: Provider, code: string) =>
    res.redirect(`${frontendUrl()}/login?oauth_error=${encodeURIComponent(code)}&provider=${provider}`);

const stateSecret = () => process.env.JWT_SECRET || '';

export const oauthStart = async (req: Request, res: Response) => {
    const provider = req.params.provider as Provider;
    if (provider !== 'google' && provider !== 'github') {
        return res.status(404).json({ message: 'Provider tidak dikenal.' });
    }

    const { id, ready } = credentials(provider);
    if (!ready) return fail(res, provider, 'not_configured');

    const state = jwt.sign({ p: provider, n: crypto.randomBytes(8).toString('hex') }, stateSecret(), { expiresIn: '10m' });

    const url = provider === 'google'
        ? 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
            client_id: id,
            redirect_uri: callbackUrl(provider),
            response_type: 'code',
            scope: 'openid email profile',
            state,
            access_type: 'online',
            prompt: 'select_account',
        })
        : 'https://github.com/login/oauth/authorize?' + new URLSearchParams({
            client_id: id,
            redirect_uri: callbackUrl(provider),
            scope: 'read:user user:email',
            state,
        });

    return res.redirect(url);
};

async function exchangeCode(provider: Provider, code: string): Promise<string> {
    const { id, secret } = credentials(provider);

    const tokenEndpoint = provider === 'google'
        ? 'https://oauth2.googleapis.com/token'
        : 'https://github.com/login/oauth/access_token';

    const body = new URLSearchParams({
        client_id: id,
        client_secret: secret,
        code,
        redirect_uri: callbackUrl(provider),
        grant_type: 'authorization_code',
    });

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body,
        signal: AbortSignal.timeout(15000),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || data.error || 'Gagal menukar kode otorisasi.');
    }
    return data.access_token as string;
}

async function fetchProfile(provider: Provider, accessToken: string): Promise<{ email: string | null; name: string | null }> {
    if (provider === 'google') {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(15000),
        });
        const data: any = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error('Gagal mengambil profil Google.');
        return { email: data.email || null, name: data.name || null };
    }

    const response = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'User-Agent': 'JagoBot' },
        signal: AbortSignal.timeout(15000),
    });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Gagal mengambil profil GitHub.');

    let email: string | null = data.email || null;
    if (!email) {
        // Email sering disembunyikan; ambil yang primary & terverifikasi.
        const emailsRes = await fetch('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'User-Agent': 'JagoBot' },
            signal: AbortSignal.timeout(15000),
        });
        const emails: any = await emailsRes.json().catch(() => []);
        if (Array.isArray(emails)) {
            const primary = emails.find((e: any) => e.primary && e.verified) || emails.find((e: any) => e.verified);
            email = primary?.email || null;
        }
    }

    return { email, name: data.name || data.login || null };
}

export const oauthCallback = async (req: Request, res: Response) => {
    const provider = req.params.provider as Provider;
    const { code, state, error } = req.query as Record<string, string>;

    if (provider !== 'google' && provider !== 'github') {
        return res.status(404).json({ message: 'Provider tidak dikenal.' });
    }
    if (error) return fail(res, provider, 'access_denied');
    if (!code || !state) return fail(res, provider, 'invalid_request');

    try {
        const payload = jwt.verify(state, stateSecret()) as { p?: string };
        if (payload.p !== provider) return fail(res, provider, 'state_mismatch');
    } catch {
        return fail(res, provider, 'state_expired');
    }

    try {
        const accessToken = await exchangeCode(provider, code);
        const { email, name } = await fetchProfile(provider, accessToken);

        if (!email) return fail(res, provider, 'email_unavailable');

        const normalizedEmail = email.toLowerCase();
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { bots: true } });

        if (!user) {
            // Password acak: akun ini hanya bisa masuk lewat OAuth sampai user
            // mengatur password sendiri melalui fitur lupa password.
            const randomPassword = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
            const namaToko = (name || normalizedEmail.split('@')[0]).slice(0, 60);

            user = await prisma.user.create({
                data: {
                    nama_toko: namaToko,
                    email: normalizedEmail,
                    password: randomPassword,
                    bots: { create: { nama_bot: `Asisten ${namaToko}`, personality: 'Ramah' } },
                },
                include: { bots: true },
            });
        }

        let role = user.role || 'USER';
        const bootstrapEmail = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
        if (bootstrapEmail && normalizedEmail === bootstrapEmail && role !== 'SUPER_ADMIN') {
            await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPER_ADMIN' } });
            role = 'SUPER_ADMIN';
        }

        prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => { /* abaikan */ });

        const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        return res.redirect(`${frontendUrl()}/oauth/callback?token=${encodeURIComponent(token)}`);
    } catch (err: any) {
        console.error(`[OAuth:${provider}] Gagal:`, err?.message || err);
        return fail(res, provider, 'provider_error');
    }
};
