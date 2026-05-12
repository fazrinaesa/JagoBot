import {
  Bot,
  ChevronRight,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Database,
  BarChart3,
  Sparkles
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Sun, Moon } from "lucide-react";
import { Logo } from "../components/Logo";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 group"
  >
    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 group-hover:bg-[#1800ad]/10 dark:group-hover:bg-[#1800ad]/30 rounded-2xl flex items-center justify-center mb-6 transition-colors">
      <Icon className="w-7 h-7 text-brand-blue dark:text-blue-400 group-hover:text-[#1800ad] dark:group-hover:text-blue-300 transition-colors" />
    </div>
    <h3 className="text-lg font-display font-bold text-brand-blue dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    // Penyesuaian: Mengganti bg-white menjadi gradasi (biru muda, #1800ad, dan putih)
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-[#1800ad]/30 bg-gradient-to-br from-blue-100 via-[#1800ad]/15 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-transparent dark:border-slate-800/50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo iconSize={32} textSize="text-xl" />
          </div>

          <div className="hidden md:flex items-center gap-10">
            {["Fitur", "Cara Kerja", "Harga"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 hover:text-[#1800ad] dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login" className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-blue dark:text-blue-400 hover:text-[#1800ad] dark:hover:text-blue-300 transition-colors">Masuk</Link>
            <Link to="/register" className="bg-[#1800ad] text-white px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#1800ad]/30 hover:scale-105 active:scale-95 transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1800ad]/20 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[100px] -ml-72 -mb-72" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1800ad]/10 dark:bg-blue-500/10 text-[#1800ad] dark:text-blue-400 rounded-full text-[9px] font-bold uppercase tracking-widest mb-6 border border-[#1800ad]/20 dark:border-blue-500/20">
                <Sparkles className="w-3 h-3" /> Solusi AI untuk UMKM Indonesia 🇮🇩
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-display font-bold text-brand-blue dark:text-white leading-[1.15] mb-6 tracking-tighter">
                Chatbot Pintar <br />
                <span className="text-[#1800ad] dark:text-blue-400 italic">Otomatis</span> Untuk <br />
                Bisnis Anda
              </h1>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-10 max-w-lg leading-relaxed font-medium">
                Tingkatkan layanan pelanggan Anda tanpa biaya mahal. JagoBot membantu UMKM mengotomatisasi tanya jawab dan pesanan 24/7.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link to="/register" className="w-full sm:w-auto bg-[#1800ad] text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-2xl shadow-[#1800ad]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Mulai Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="w-full sm:w-auto bg-white dark:bg-slate-800 text-brand-blue dark:text-white border-2 border-slate-100 dark:border-slate-700 px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  Lihat Demo
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-10 h-10 rounded-xl border-4 border-white shadow-sm" alt="User" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest">
                  Bergabung dengan <span className="text-[#1800ad] dark:text-blue-400">2,000+</span> UMKM lainnya
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl bg-slate-900 rounded-t-xl p-3 shadow-2xl scale-90 transition-transform">
                <div className="bg-slate-800 h-6 rounded-t-lg mb-1 flex items-center px-4 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>

                <div className="relative bg-white rounded-b-lg border border-slate-700 overflow-hidden aspect-[16/10]">
                  <div className="bg-[#0A2647] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Logo iconSize={24} textSize="text-[10px]" variant="flat" />
                      <div>
                        <span className="text-white font-bold text-[10px] uppercase tracking-widest block">JagoBot Assistant</span>
                        <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" /> Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 bg-slate-50/30 h-[calc(100%-110px)] overflow-y-auto">
                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs text-brand-blue font-medium max-w-[80%] border border-slate-50">
                      Halo! Selamat datang di Warung Berkah. Ada yang bisa saya bantu?
                    </div>
                    <div className="bg-[#1800ad] text-white p-3 rounded-xl rounded-tr-none shadow-xl shadow-[#1800ad]/20 text-xs font-medium ml-auto max-w-[80%]">
                      Berapa harga Kopi Gayo hari ini?
                    </div>
                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs text-brand-blue font-medium max-w-[80%] border border-slate-50">
                      Harga Kopi Gayo hari ini Rp 85.000 per 250gr, Kak. Sedang ada promo beli 2 gratis 1! ☕️
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-50 flex gap-2 absolute bottom-0 left-0 w-full">
                    <div className="flex-1 h-10 bg-slate-50 rounded-xl px-4 flex items-center text-slate-300 text-[10px] font-medium">
                      Ketik pesan...
                    </div>
                    <div className="w-10 h-10 bg-[#1800ad] rounded-xl flex items-center justify-center text-white">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto w-[100%] h-6 bg-slate-700 rounded-b-xl shadow-lg border-t border-slate-600 scale-90">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-800 rounded-b-md"></div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-none flex items-center gap-3 z-20 scale-90"
              >
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase">Respon Cepat</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-white">&lt; 1 Detik</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="py-12 border-none relative z-10 -mt-[1px]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 dark:text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
            Bagian dari Ekosistem JagoAI
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
            <img
              src="/JagoNota.png"
              alt="JagoNota"
              className="h-30 w-auto object-contain hover:scale-110 transition-transform duration-300"
            />
            <img
              src="/JagoCV.png"
              alt="JagoCV"
              className="h-30 w-auto object-contain hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="fitur" className="py-24 px-6 border-none -mt-[1px]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-blue/70 font-bold text-[10px] tracking-[0.4em] uppercase mb-3 block">
              Fitur Unggulan
            </span>            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue dark:text-white mb-5 tracking-tight">Teknologi AI Masa Depan</h2>
            <p className="text-slate-600 dark:text-slate-500 max-w-xl mx-auto text-base leading-relaxed font-medium">Kami menghadirkan teknologi tercanggih yang dikemas dalam antarmuka yang sangat mudah digunakan.</p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div
                style={{ backgroundColor: '#1800ad' }}
                className="p-8 rounded-[2rem] text-white shadow-xl shadow-[#1800ad]/20 relative overflow-hidden border-none"
              >
                <FeatureCard
                  icon={Bot}
                  title="AI Chatbot Cerdas"
                  description="Menggunakan teknologi LLM terbaru untuk memahami konteks percakapan pelanggan dengan akurasi tinggi."
                />
              </div>

              <motion.div
                whileHover={{ y: -10 }}
                style={{ backgroundColor: '#1800ad' }}
                className="p-8 rounded-[2rem] text-white shadow-xl shadow-[#1800ad]/20 relative overflow-hidden group border-none"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold mb-3">Cloud Technology</h3>
                <p className="text-sm text-blue-200 leading-relaxed font-medium opacity-80">Akses chatbot Anda dari mana saja, kapan saja. Data tersimpan aman di cloud global.</p>
              </motion.div>

              <div
                style={{ backgroundColor: '#1800ad' }}
                className="p-8 rounded-[2rem] text-white shadow-xl shadow-[#1800ad]/20 dark:shadow-blue-900/20 relative overflow-hidden border-none"
              >
                <FeatureCard
                  icon={Zap}
                  title="Customer Support 24/7"
                  description="Jangan biarkan pelanggan menunggu. Bot kami siap melayani pesanan dan pertanyaan setiap saat."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-24 px-6 bg-slate-50/50 dark:bg-slate-950/50 border-none -mt-[1px] outline-none">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1800ad] dark:text-blue-400 font-bold text-[10px] tracking-[0.4em] uppercase mb-3 block">Harga Transparan</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue dark:text-white mb-4 tracking-tight">Pilih Paket Sesuai Kebutuhan</h2>
            <p className="text-slate-700 dark:text-slate-500 max-w-xl mx-auto text-base font-medium">Mulai dari gratis hingga paket kustom untuk bisnis yang berkembang pesat.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Gratis", price: "Rp 0", desc: "Cocok untuk mencoba", features: ["70 Chat / Bulan", "1 Knowledge Base", "Integrasi Website", "Support Komunitas"] },
              { name: "Pro", price: "Rp 149rb", desc: "Paling populer untuk UMKM", features: ["Unlimited Chat", "10 Knowledge Base", "Integrasi WhatsApp", "Upload Dokumen (PDF/Doc)", "Analitik Lengkap"], popular: true },
              { name: "Premium", price: "Rp 499rb", desc: "Untuk skala besar", features: ["Semua Fitur Pro", "API Access", "Custom Branding", "Multi-Admin Dashboard", "Dedicated Support 24/7"] }
            ].map((plan, idx) => (
              <div key={idx} className={cn(
                "p-8 rounded-[2.5rem] border-none transition-all duration-300 relative",
                plan.popular
                  ? "bg-white dark:bg-slate-800 shadow-2xl shadow-[#1800ad]/10 dark:shadow-slate-900/50 scale-105 z-10"
                  : "bg-white dark:bg-slate-900 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-slate-900/50"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1800ad] dark:bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-lg font-display font-bold text-brand-blue dark:text-white mb-1">{plan.name}</h3>
                <p className="text-slate-700 dark:text-slate-400 text-xs mb-6 font-medium">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-bold text-brand-blue dark:text-white">{plan.price}</span>
                  <span className="text-slate-700 dark:text-slate-500 font-bold text-xs">/bulan</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                        <ChevronRight className="w-2.5 h-2.5" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={cn(
                    "w-full py-3.5 rounded-xl text-xs font-bold text-center block transition-all",
                    plan.popular
                      ? "bg-[#1800ad] dark:bg-blue-600 text-white shadow-xl shadow-[#1800ad]/20 dark:shadow-blue-900/20 hover:scale-105"
                      : "bg-slate-50 dark:bg-slate-800 text-brand-blue dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  Pilih Paket
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="cara-kerja" className="py-24 px-6 border-none -mt-[1px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-slate-600 dark:text-slate-300 mb-10 tracking-tight">Cara Kerja JagoBot</h2>

              <div className="space-y-8">
                {[
                  { step: "01", title: "Daftar & Buat Akun", desc: "Hanya butuh 2 menit untuk memulai perjalanan AI Anda." },
                  { step: "02", title: "Latih Bot Anda", desc: "Unggah daftar harga, jam buka, dan info produk Anda." },
                  { step: "03", title: "Atur Profil Bot", desc: "Pilih gaya bahasa yang sesuai dengan brand toko Anda." },
                  { step: "04", title: "Hubungkan & Selesai", desc: "Aktifkan di WhatsApp atau Website dan biarkan bot bekerja." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="text-4xl font-display font-bold text-[#1800ad]/40 dark:text-blue-500/40 group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors duration-300 leading-none">
                      {item.step}
                    </div>

                    <div>
                      <h4 className="text-xl font-display font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-[#1800ad]/10 dark:bg-blue-500/10 rounded-[2rem] blur-2xl" />
              <img
                src="https://picsum.photos/seed/setup/450/450"
                alt="Setup Process"
                className="relative rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-800 aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-none -mt-[1px]">
        <div className="max-w-5xl mx-auto bg-brand-blue dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-none border border-transparent dark:border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1800ad]/20 dark:bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-6">Siap Membuat Bisnis Anda Lebih Jago?</h2>
            <p className="text-blue-800 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">Bergabunglah dengan ribuan UMKM lainnya yang telah menggunakan JagoBot untuk meningkatkan efisiensi.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-[#1800ad] dark:bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-[#1800ad]/30 dark:shadow-blue-900/30">
              Mulai Gratis Sekarang <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-none px-6 -mt-[1px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo iconSize={32} textSize="text-xl" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs">© 2026 JagoBot Indonesia. Semua hak dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-800 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white transition-colors font-bold uppercase tracking-widest">Twitter</a>
            <a href="#" className="text-xs text-slate-800 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white transition-colors font-bold uppercase tracking-widest">Instagram</a>
            <a href="#" className="text-xs text-slate-800 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white transition-colors font-bold uppercase tracking-widest">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};