import { Bot, Mail, Lock, ArrowRight, Github } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "../components/Logo";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nama_toko', data.nama_toko);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert("Berhasil Masuk! Selamat datang kembali.");
        navigate("/dashboard");
      } else {
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
    // Penyesuaian: Mengikuti gradasi background Landing Page
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#1800ad]/15 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-500">

      {/* Decorative Background Elements - Penyesuaian warna ke #1800ad */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1800ad]/15 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex justify-center mb-8 group">
            <Logo iconSize={48} textSize="text-3xl" />
          </Link>
          <h1 className="text-3xl font-bold text-brand-blue dark:text-white tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-semibold uppercase text-[10px] tracking-[0.2em]">Kelola Chatbot Pintar Anda</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-10 rounded-[2.5rem] shadow-2xl shadow-[#1800ad]/10 border border-white backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Bisnis</label>
              <div className="relative group">
                {/* Penyesuaian warna fokus ke #1800ad */}
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@toko.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3 ml-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#1800ad] hover:opacity-80 transition-opacity">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Penyesuaian warna button ke #1800ad */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#1800ad] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-[#1800ad]/30 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoading ? "Mengecek..." : "Masuk Sekarang"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Atau masuk dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:bg-slate-800/50 transition-all font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
            </button>
            <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:bg-slate-800/50 transition-all font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">
          Belum punya akun? <Link to="/register" className="text-[#1800ad] font-bold hover:underline ml-1">Daftar Gratis</Link>
        </p>
      </motion.div>
    </div>
  );
};