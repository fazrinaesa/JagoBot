import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://evkphxqdswcvjmsfsduk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            where: { id: userId },
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

        if (!file) {
            return res.status(400).json({ message: "File gambar tidak ditemukan" });
        }

        if (!supabaseKey) {
            return res.status(500).json({ message: "Konfigurasi SUPABASE_ANON_KEY belum diatur di server. Tambahkan di file .env backend Anda." });
        }

        const fileName = `avatar-${userId}-${Date.now()}`;
        const fileBuffer = fs.readFileSync(file.path);
        
        // Upload file to Supabase Storage "avatars" bucket
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, fileBuffer, {
                contentType: file.mimetype,
                upsert: true
            });

        // Clean up temp file
        fs.unlinkSync(file.path);

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        const avatarUrl = publicUrlData.publicUrl;

        // Save URL to User table
        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl }
        });

        res.json({ message: "Foto profil berhasil diunggah", avatarUrl });
    } catch (error: any) {
        console.error("Error uploadAvatar:", error);
        res.status(500).json({ message: "Gagal mengunggah foto profil", error: error.message });
    }
};

export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        
        // Prisma Cascade delete will handle Bot and related data deletion automatically
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ message: "Akun berhasil dihapus secara permanen" });
    } catch (error) {
        console.error("Error deleteAccount:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menghapus akun" });
    }
};
