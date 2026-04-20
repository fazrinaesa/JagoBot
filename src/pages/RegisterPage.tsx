import { Bot, Mail, Lock, ArrowRight, User, Store } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    email: "",
    password: ""
  });

  // State tambahan untuk loading agar tombol tidak diklik berkali-kali
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Menghubungkan ke port 5000 yang sudah kita buat tadi
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Kita sesuaikan nama field dengan yang diminta backend (prisma)
          nama_toko: formData.storeName,
          email: formData.email,
          password: formData.password
          // 'name' bisa kamu simpan juga jika skema prisma-mu sudah mendukung
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Selamat! Registrasi JagoBot Berhasil.");
        navigate("/login"); // Pindah ke login setelah sukses
      } else {
        // Menampilkan pesan error dari backend (misal: Email sudah terdaftar)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -mr-64 -mb-64" />

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mulai Bisnis Pintar Anda</h1>
          <p className="text-slate-500 mt-3 font-medium">Daftar gratis dan buat chatbot pertama Anda</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nama</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Budi"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Toko</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="Berkah"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Bisnis</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@toko.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 karakter"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 ml-1">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-200 text-brand-orange focus:ring-brand-orange cursor-pointer" />
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                Saya menyetujui <a href="#" className="text-brand-blue hover:text-brand-orange transition-colors">Syarat & Ketentuan</a> serta <a href="#" className="text-brand-blue hover:text-brand-orange transition-colors">Kebijakan Privasi</a> JagoBot.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-brand-orange text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-orange/30 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"} <ArrowRight className="w-6 h-6" />
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-500 font-medium">
          Sudah punya akun? <Link to="/login" className="text-brand-blue font-black hover:opacity-80 transition-opacity ml-1">Masuk di sini</Link>
        </p>
      </motion.div>
    </div>
  );
};