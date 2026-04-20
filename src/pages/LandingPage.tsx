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
import { cn } from "../lib/utils";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-10 rounded-[2.5rem] bg-white border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group"
  >
    <div className="w-16 h-16 bg-slate-50 group-hover:bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-8 transition-colors">
      <Icon className="w-8 h-8 text-brand-blue group-hover:text-brand-orange transition-colors" />
    </div>
    <h3 className="text-xl font-black text-brand-blue mb-4 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Bot className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black text-brand-blue tracking-tighter italic">JagoBot</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            {["Fitur", "Cara Kerja", "Harga"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-orange transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue hover:text-brand-orange transition-colors">Masuk</Link>
            <Link to="/register" className="bg-brand-orange text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-orange/30 hover:scale-105 active:scale-95 transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] -ml-72 -mb-72" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-brand-orange/20">
                <Sparkles className="w-3 h-3" /> Solusi AI untuk UMKM Indonesia 🇮🇩
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-brand-blue leading-[0.9] mb-10 tracking-tighter">
                Chatbot Pintar <br />
                <span className="text-brand-orange italic">Otomatis</span> Untuk <br />
                Bisnis Anda
              </h1>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
                Tingkatkan layanan pelanggan Anda tanpa biaya mahal. JagoBot membantu UMKM mengotomatisasi tanya jawab dan pesanan 24/7.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link to="/register" className="w-full sm:w-auto bg-brand-orange text-white px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-orange/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Mulai Sekarang <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="w-full sm:w-auto bg-white text-brand-blue border-2 border-slate-100 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                  Lihat Demo
                </button>
              </div>

              <div className="mt-16 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-12 h-12 rounded-2xl border-4 border-white shadow-sm" alt="User" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                  Bergabung dengan <span className="text-brand-orange">2,000+</span> UMKM lainnya
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              {/* Laptop Wrapper */}
              <div className="relative mx-auto w-full max-w-2xl bg-slate-900 rounded-t-xl p-3 shadow-2xl">
                {/* Screen Header */}
                <div className="bg-slate-800 h-6 rounded-t-lg mb-1 flex items-center px-4 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>

                {/* Original Chat Content - adjusted size to fit screen */}
                <div className="relative bg-white rounded-b-lg border border-slate-700 overflow-hidden aspect-[16/10]">
                  <div className="bg-brand-blue p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                        <Bot className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-widest block">JagoBot Assistant</span>
                        <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" /> Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 bg-slate-50/30 h-[calc(100%-110px)] overflow-y-auto">
                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs text-brand-blue font-medium max-w-[80%] border border-slate-50">
                      Halo! Selamat datang di Warung Berkah. Ada yang bisa saya bantu?
                    </div>
                    <div className="bg-brand-orange text-white p-3 rounded-xl rounded-tr-none shadow-xl shadow-brand-orange/20 text-xs font-medium ml-auto max-w-[80%]">
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
                    <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Laptop Bottom */}
              <div className="relative mx-auto w-[110%] -left-[5%] h-6 bg-slate-700 rounded-b-xl shadow-lg border-t border-slate-600">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-800 rounded-b-md"></div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Respon Cepat</p>
                <p className="text-sm font-bold text-slate-800">&lt; 1 Detik</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="py-16 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-10">Dipercaya oleh UMKM di Berbagai Platform</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/Tokopedia.svg" alt="Tokopedia" className="h-8" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="Shopee" className="h-8" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Lazada_logo.svg" alt="Lazada" className="h-8" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Bukalapak_logo.svg" alt="Bukalapak" className="h-8" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="fitur" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-brand-orange font-bold text-xs tracking-[0.4em] uppercase mb-4 block">Fitur Unggulan</span>
            <h2 className="text-4xl md:text-6xl font-black text-brand-blue mb-6 tracking-tight">Teknologi AI Masa Depan</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">Kami menghadirkan teknologi tercanggih yang dikemas dalam antarmuka yang sangat mudah digunakan oleh siapa saja.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={Bot}
              title="AI Chatbot Cerdas"
              description="Menggunakan teknologi LLM terbaru untuk memahami konteks percakapan pelanggan dengan akurasi tinggi."
            />
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-brand-blue text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-orange/20 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-110 transition-transform" />
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cloud Technology</h3>
              <p className="text-blue-100 leading-relaxed font-medium opacity-80">Akses chatbot Anda dari mana saja, kapan saja. Data tersimpan aman di infrastruktur cloud global.</p>
            </motion.div>
            <FeatureCard
              icon={Zap}
              title="Customer Support 24/7"
              description="Jangan biarkan pelanggan menunggu. Bot kami siap melayani pesanan dan pertanyaan di tengah malam sekalipun."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-brand-orange font-bold text-xs tracking-[0.4em] uppercase mb-4 block">Harga Transparan</span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-blue mb-4 tracking-tight">Pilih Paket Sesuai Kebutuhan</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Mulai dari gratis hingga paket kustom untuk bisnis yang sedang berkembang pesat.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Gratis", price: "Rp 0", desc: "Cocok untuk mencoba", features: ["10 Chat / Bulan", "1 Knowledge Base", "Integrasi Website", "Support Komunitas"] },
              { name: "Pro", price: "Rp 149rb", desc: "Paling populer untuk UMKM", features: ["Unlimited Chat", "10 Knowledge Base", "Integrasi WhatsApp", "Analitik Lengkap", "Support Prioritas"], popular: true },
              { name: "Bisnis", price: "Rp 499rb", desc: "Untuk skala besar", features: ["Semua Fitur Pro", "API Access", "Custom Branding", "Dedicated Account Manager", "SLA 99.9%"] }
            ].map((plan, idx) => (
              <div key={idx} className={cn(
                "p-10 rounded-[3rem] border transition-all duration-300 relative",
                plan.popular
                  ? "bg-white border-brand-orange shadow-2xl shadow-brand-orange/10 scale-105 z-10"
                  : "bg-white border-slate-100 shadow-sm hover:shadow-xl"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-xl font-bold text-brand-blue mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6 font-medium">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-brand-blue">{plan.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/bulan</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-center block transition-all",
                    plan.popular
                      ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/20 hover:scale-105"
                      : "bg-slate-50 text-brand-blue hover:bg-slate-100"
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
      <section id="cara-kerja" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-brand-blue mb-8">Cara Kerja JagoBot</h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Daftar & Buat Akun", desc: "Hanya butuh 2 menit untuk memulai perjalanan AI Anda." },
                  { step: "02", title: "Latih Bot Anda", desc: "Unggah daftar harga, jam buka, dan info produk Anda." },
                  { step: "03", title: "Atur Kepribadian", desc: "Pilih gaya bahasa yang sesuai dengan brand toko Anda." },
                  { step: "04", title: "Hubungkan & Selesai", desc: "Aktifkan di WhatsApp atau Website dan biarkan bot bekerja." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="text-4xl font-black text-brand-orange/20">{item.step}</div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-blue mb-1">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-orange/10 rounded-[2rem] blur-2xl" />
              <img
                src="https://picsum.photos/seed/setup/600/600"
                alt="Setup Process"
                className="relative rounded-[2rem] shadow-2xl border-4 border-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-brand-blue rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Siap Membuat Bisnis Anda Lebih Jago?</h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">Bergabunglah dengan ribuan UMKM lainnya yang telah menggunakan JagoBot untuk meningkatkan efisiensi.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-brand-orange text-white px-10 py-4 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-xl shadow-brand-orange/30">
              Mulai Gratis Sekarang <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-brand-blue">JagoBot</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 JagoBot Indonesia. Semua hak dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">Instagram</a>
            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};