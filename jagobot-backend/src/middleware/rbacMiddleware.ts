import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * RBAC (Role-Based Access Control) — Fase 1
 *
 * Peran yang didukung (kolom User.role):
 *   USER         — pemilik UMKM (default semua pendaftar)
 *   SUPER_ADMIN  — pengelola platform: pembayaran dan seluruh administrasi global.
 *
 * Catatan kompatibilitas:
 *   Token lama (dibuat sebelum fitur ini) TIDAK memuat `role`.
 *   Agar tidak memaksa semua orang login ulang, `role` dibaca ulang dari
 *   database bila tidak ada di token. Hasilnya di-cache di objek req.
 */

export const ROLES = {
    USER: 'USER',
    SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Ambil role user dari token; bila token tidak memuat role (token lama),
 * ambil dari database lalu simpan di req.user.role agar tidak query berulang.
 */
const resolveRole = async (req: any): Promise<string> => {
    if (req.user?.role) return req.user.role;

    const userId = req.user?.id || req.user?.userId;
    if (!userId) return ROLES.USER;

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
    });

    const role = user?.role || ROLES.USER;
    if (req.user) req.user.role = role; // cache di request
    return role;
};

/**
 * Middleware factory: hanya izinkan peran tertentu.
 * Contoh: router.get('/x', verifyToken, requireRole('SUPER_ADMIN'), handler)
 */
export const requireRole = (...allowed: string[]) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            const role = await resolveRole(req);
            if (!allowed.includes(role)) {
                return res.status(403).json({
                    message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
                    requiredRole: allowed,
                    yourRole: role,
                });
            }
            next();
        } catch (err) {
            console.error('[RBAC] Gagal memverifikasi peran:', err);
            res.status(500).json({ message: 'Gagal memverifikasi hak akses.' });
        }
    };
};

/** Hanya SUPER_ADMIN (mis. konfigurasi AI, kelola role) */
export const requireSuperAdmin = requireRole(ROLES.SUPER_ADMIN);



/**
 * Tolak akun yang dinonaktifkan (isActive = false).
 * Dipasang pada aksi sensitif; tidak menggantikan verifyToken.
 */
export const requireActiveAccount = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) return next();

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { isActive: true },
        });

        if (user && user.isActive === false) {
            return res.status(403).json({ message: 'Akun Anda dinonaktifkan. Hubungi administrator.' });
        }
        next();
    } catch (err) {
        console.error('[RBAC] Gagal memeriksa status akun:', err);
        next(); // jangan blokir karena error tak terduga
    }
};
