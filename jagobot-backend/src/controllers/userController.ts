import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import prisma from '../lib/prisma';

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                nama_toko: true,
                email: true,
                nama_lengkap: true,
                whatsapp: true,
                alamat: true,
                avatarUrl: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error getProfile:", error);
        res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { nama_lengkap, email, nama_toko, whatsapp, alamat, avatarUrl } = req.body;

        // Validasi format email (sederhana)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: "Format email tidak valid" });
        }

        // Validasi nomor WA (hanya angka)
        if (whatsapp && !/^\d+$/.test(whatsapp)) {
            return res.status(400).json({ message: "Nomor WhatsApp hanya boleh berisi angka" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                nama_lengkap,
                email,
                nama_toko,
                whatsapp,
                alamat,
                ...(avatarUrl && { avatarUrl })
            },
            select: {
                id: true,
                nama_toko: true,
                email: true,
                nama_lengkap: true,
                whatsapp: true,
                alamat: true,
                avatarUrl: true
            }
        });

        res.json({ message: "Profil berhasil diperbarui", user: updatedUser });
    } catch (error) {
        console.error("Error updateProfile:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memperbarui profil" });
    }
};

export const uploadAvatar = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "File tidak ditemukan" });
    if (!file.buffer?.length) return res.status(400).json({ message: "File foto kosong atau tidak terbaca" });

    const ext = (file.originalname.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg').toLowerCase();
    const fileName = `avatar-${userId}-${Date.now()}${ext}`;

    // Simpan ke disk lokal (folder uploads sudah di-serve di /uploads oleh server.ts).
    // ponytail: disk lokal, cukup untuk 1 server. Ganti ke Supabase/S3 kalau deploy multi-instance / Vercel.
    const uploadDir = path.join(__dirname, '../../uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
    const publicUrl = `/uploads/${fileName}`;

    await prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: {
        avatarUrl: publicUrl
      }
    });

    res.json({ message: "Berhasil", avatarUrl: publicUrl });
  } catch (error: any) {
    console.error("Avatar upload failed:", error);
    res.status(500).json({ message: "Gagal menyimpan foto profil. Periksa konfigurasi storage dan database." });
  }
};

export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        
        // Prisma Cascade delete will handle Bot and related data deletion automatically
        await prisma.user.delete({
            where: { id: Number(userId) }
        });

        res.json({ message: "Akun berhasil dihapus secara permanen" });
    } catch (error) {
        console.error("Error deleteAccount:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menghapus akun" });
    }
};