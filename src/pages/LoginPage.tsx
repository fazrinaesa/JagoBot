import { Bot, Mail, Lock, ArrowRight, Github } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State untuk mengontrol status loading
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Menghubungkan ke endpoint login di backend port 5000
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Simpan token JWT
        localStorage.setItem('token', data.token);

        // 2. SIMPAN NAMA TOKO (Tambahkan baris ini!)
        // Sesuai dengan response backend kamu: res.json({ token, nama_toko: user.nama_toko })
        localStorage.setItem('nama_toko', data.nama_toko);

        // 3. Simpan data user lengkap (Opsional)
        localStorage.setItem('user', JSON.stringify(data.user));

        alert("Berhasil Masuk! Selamat datang kembali.");
        navigate("/dashboard");
      } else {
        // Tampilkan pesan error jika email/password salah
        alert(data.message || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Error saat login:", error);
      alert("Gagal terhubung ke server. Pastikan backend sudah menyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -ml-64 -mb-64" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-14 h-14 bg-brand-orange rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-brand-orange/30 group-hover:rotate-6 transition-transform">
              <Bot className="text-white w-8 h-8" />
            </div>
            <span className="text-4xl font-black text-brand-blue tracking-tighter italic">JagoBot</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-3 font-medium">Masuk untuk mengelola chatbot pintar Anda</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Bisnis</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@toko.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3 ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                <a href="#" className="text-xs font-bold text-brand-orange hover:opacity-80 transition-opacity">Lupa Password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-brand-orange text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-orange/30 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoading ? "Mengecek..." : "Masuk Sekarang"} <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="px-4 bg-white text-slate-300">Atau masuk dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
            </button>
            <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-brand-orange font-black hover:opacity-80 transition-opacity ml-1">Daftar Gratis</Link>
        </p>
      </motion.div>
    </div>
  );
};