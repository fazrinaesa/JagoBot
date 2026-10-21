import { Response } from 'express';
import prisma from '../lib/prisma';
import { ROLES } from '../middleware/rbacMiddleware';

/**
 * Controller Super Admin — Fase 1 (RBAC)
 *
 * Endpoint di sini hanya boleh diakses peran SUPER_ADMIN
 * (dijaga oleh middleware `requireSuperAdmin` di adminRoutes.ts).
 */

const VALID_ROLES = [ROLES.USER, ROLES.SUPER_ADMIN];

/**
 * GET /api/admin/overview
 * Ringkasan global sistem.
 */
export const getOverview = async (_req: any, res: Response) => {
    try {
        const [totalUsers, totalBots, totalKb, totalChats, roleBreakdown] = await Promise.all([
            prisma.user.count(),
            prisma.bot.count(),
            prisma.knowledgeBase.count(),
            prisma.chatLog.count(),
            prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
        ]);

        res.json({
            totalUsers,
            totalBots,
            totalKnowledgeBases: totalKb,
            totalChats,
            roleBreakdown: roleBreakdown.map(r => ({ role: r.role, count: r._count.role })),
        });
    } catch (error) {
        console.error('[Admin] getOverview error:', error);
        res.status(500).json({ message: 'Gagal mengambil ringkasan.' });
    }
};

/**
 * GET /api/admin/users?search=&role=&page=&limit=
 * Daftar seluruh pengguna (tanpa password).
 */
export const listUsers = async (req: any, res: Response) => {
    try {
        const search = (req.query.search as string || '').trim();
        const role = (req.query.role as string || '').trim();
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { nama_toko: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role && VALID_ROLES.includes(role as any)) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, nama_toko: true, email: true, nama_lengkap: true,
                    role: true, isActive: true, createdAt: true, lastLoginAt: true,
                    _count: { select: { bots: true } },
                },
                orderBy: { id: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            data: users.map(u => ({
                id: u.id,
                nama_toko: u.nama_toko,
                email: u.email,
                nama_lengkap: u.nama_lengkap,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt,
                lastLoginAt: u.lastLoginAt,
                totalBots: u._count.bots,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('[Admin] listUsers error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar pengguna.' });
    }
};

/**
 * PATCH /api/admin/users/:id/role   body: { role }
 * Ubah peran pengguna.
 */
export const updateUserRole = async (req: any, res: Response) => {
    try {
        const targetId = Number(req.params.id);
        const { role } = req.body;

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ message: `Role tidak valid. Pilih salah satu: ${VALID_ROLES.join(', ')}` });
        }

        // Cegah super admin menurunkan dirinya sendiri (menghindari terkunci)
        const meId = req.user?.id || req.user?.userId;
        if (Number(meId) === targetId && role !== ROLES.SUPER_ADMIN) {
            return res.status(400).json({ message: 'Anda tidak dapat menurunkan peran akun Anda sendiri.' });
        }

        const updated = await prisma.user.update({
            where: { id: targetId },
            data: { role },
            select: { id: true, email: true, role: true },
        });

        res.json({ message: 'Peran berhasil diperbarui.', user: updated });
    } catch (error: any) {
        console.error('[Admin] updateUserRole error:', error);
        if (error?.code === 'P2025') return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        res.status(500).json({ message: 'Gagal memperbarui peran.' });
    }
};

/**
 * PATCH /api/admin/users/:id/status   body: { isActive }
 * Aktifkan / nonaktifkan akun.
 */
export const updateUserStatus = async (req: any, res: Response) => {
    try {
        const targetId = Number(req.params.id);
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'Field "isActive" harus bernilai true atau false.' });
        }

        const meId = req.user?.id || req.user?.userId;
        if (Number(meId) === targetId && isActive === false) {
            return res.status(400).json({ message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' });
        }

        const updated = await prisma.user.update({
            where: { id: targetId },
            data: { isActive },
            select: { id: true, email: true, isActive: true },
        });

        res.json({ message: isActive ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.', user: updated });
    } catch (error: any) {
        console.error('[Admin] updateUserStatus error:', error);
        if (error?.code === 'P2025') return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        res.status(500).json({ message: 'Gagal memperbarui status akun.' });
    }
};

/**
 * GET /api/admin/me
 * Info peran pemanggil — berguna untuk frontend menampilkan menu.
 */
export const getMe = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { id: true, email: true, nama_toko: true, role: true, isActive: true },
        });
        if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        res.json(user);
    } catch (error) {
        console.error('[Admin] getMe error:', error);
        res.status(500).json({ message: 'Gagal mengambil data.' });
    }
};
