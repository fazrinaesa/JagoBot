import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

    try {
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
                botId: user.bots[0]?.id // Mengambil ID bot pertama milik user
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi." });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        // Proteksi User Enumeration: Tetap kembalikan pesan sukses meskipun email tidak ditemukan
        if (!user) {
            return res.status(200).json({ 
                message: "Jika email Anda terdaftar dalam sistem kami, tautan pengaturan ulang kata sandi telah dikirimkan ke email Anda." 
            });
        }

        // Generate stateless token menggunakan JWT_SECRET + password lama
        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${token}&id=${user.id}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"JagoBot Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Pengaturan Ulang Kata Sandi JagoBot',
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1800ad;">Atur Ulang Kata Sandi Anda</h2>
                    <p>Halo ${user.nama_toko},</p>
                    <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun JagoBot Anda. Jika Anda merasa tidak meminta ini, abaikan saja email ini.</p>
                    <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda. Tautan ini hanya berlaku selama 15 menit.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #1800ad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Atur Ulang Kata Sandi</a>
                    </div>
                    <p style="font-size: 12px; color: #666;">Atau salin tautan ini ke browser Anda: <br/> ${resetLink}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: "Jika email Anda terdaftar dalam sistem kami, tautan pengaturan ulang kata sandi telah dikirimkan ke email Anda." 
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat memproses permintaan." });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { id, token, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
            return res.status(400).json({ message: "Tautan tidak valid atau pengguna tidak ditemukan." });
        }

        const secret = process.env.JWT_SECRET + user.password;
        
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({ message: "Tautan tidak valid atau sudah kedaluwarsa." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: "Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat mereset kata sandi." });
    }
};