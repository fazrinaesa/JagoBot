import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
export const register = async (req: Request, res: Response) => {
    const { nama_toko, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                nama_toko,
                email,
                password: hashedPassword,
                // TAMBAHKAN INI: Otomatis buatkan Bot untuk user baru
                bots: {
                    create: {
                        nama_bot: `Asisten ${nama_toko}`,
                        personality: "Ramah"
                    }
                }
            },
            include: { bots: true } // Pastikan bot yang baru dibuat ikut terambil
        });
        res.status(201).json({
            message: "Registrasi Berhasil",
            userId: user.id,
            botId: user.bots[0].id // Kirim botId pertama ke frontend jika perlu
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Email sudah terdaftar atau terjadi kesalahan" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // SESUAIKAN: Tambahkan 'include: { bots: true }' agar data bot ikut diambil dari database
    const user = await prisma.user.findUnique({
        where: { email },
        include: { bots: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Email atau Password Salah" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    // SESUAIKAN: Kirimkan objek user yang berisi botId agar bisa disimpan oleh Frontend
    res.json({
        token,
        nama_toko: user.nama_toko,
        user: {
            id: user.id,
            email: user.email,
            nama_toko: user.nama_toko,
            botId: user.bots[0]?.id // Mengambil ID bot pertama milik user (seperti ID 3 untuk Elianour)
        }
    });
};