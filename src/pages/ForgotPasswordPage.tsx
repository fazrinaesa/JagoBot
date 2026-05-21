import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "../components/Logo";
import api from "../lib/api";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message || "Tautan berhasil dikirim.");
    } catch (error: any) {
      console.error("Error forgot password:", error);
      setMessage(error.response?.data?.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#1800ad]/15 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Elements */}
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
          <h1 className="text-3xl font-bold text-brand-blue dark:text-white tracking-tight">Lupa Kata Sandi</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-semibold uppercase text-[10px] tracking-[0.2em]">Masukkan email untuk mengatur ulang</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-10 rounded-[2.5rem] shadow-2xl shadow-[#1800ad]/10 border border-white backdrop-blur-xl">
          {message ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#1800ad]/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-[#1800ad]" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {message}
              </p>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-[#1800ad] hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Terdaftar</label>
                <div className="relative group">
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

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1800ad] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-[#1800ad]/30 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoading ? "Mengirim..." : "Kirim Tautan"} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

        {!message && (
          <p className="text-center mt-10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">
            Ingat kata sandi Anda? <Link to="/login" className="text-[#1800ad] font-bold hover:underline ml-1">Masuk Kembali</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};
