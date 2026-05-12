import { Bot, Mail, Lock, ArrowRight, User, Store } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "../components/Logo";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama_toko: formData.storeName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Selamat! Registrasi JagoBot Berhasil.");
        navigate("/login");
      } else {
        alert(data.message || "Registrasi Gagal, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error saat daftar:", error);
      alert("Tidak dapat terhubung ke server. Pastikan backend sudah menyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Penyesuaian: Menggunakan gradasi background sesuai landing page
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#1800ad]/15 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-500">

      {/* Decorative Background Elements - Penyesuaian warna ke #1800ad */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1800ad]/15 rounded-full blur-[120px] -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[120px] -mr-64 -mb-64" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex justify-center mb-8 group">
            <Logo iconSize={48} textSize="text-3xl" />
          </Link>
          <h1 className="text-3xl font-bold text-brand-blue dark:text-white tracking-tight">Mulai Bisnis Pintar Anda</h1>
          <p className="text-slate-700 dark:text-slate-400 mt-3 font-semibold uppercase text-[10px] tracking-[0.2em]">Daftar gratis dan buat chatbot pertama Anda</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-10 rounded-[2.5rem] shadow-2xl shadow-[#1800ad]/10 border border-white backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Nama</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Budi"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Toko</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="Berkah"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Bisnis</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@toko.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1800ad] transition-colors" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 karakter"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/50 focus:bg-white dark:bg-slate-900 focus:border-[#1800ad] focus:ring-4 focus:ring-[#1800ad]/5 outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 ml-1">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-[#1800ad] focus:ring-[#1800ad] cursor-pointer" />
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                Saya menyetujui <a href="#" className="text-[#1800ad] hover:underline transition-colors">Syarat & Ketentuan</a> serta <a href="#" className="text-[#1800ad] hover:underline transition-colors">Kebijakan Privasi</a> JagoBot.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#1800ad] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-[#1800ad]/30 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">
          Sudah punya akun?
          <Link
            to="/login"
            className="text-[#1800ad] font-bold hover:underline transition-all ml-1"
          >
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
};