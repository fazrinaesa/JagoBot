import {
  Bot,
  ChevronRight,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  BarChart3,
  Sparkles,
  Sun,
  Moon,
  Check,
  Database,
  MessageSquare,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Logo } from "../components/Logo";
import { Badge, btn } from "../components/ui";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="group rounded-3xl border border-border-subtle bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900/60"
  >
    <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-accent-blue/10 transition-colors group-hover:bg-accent-blue/20 dark:bg-accent-blue/15">
      <Icon className="h-6.5 w-6.5 text-accent-blue dark:text-accent-blue-light" />
</div>
    <h3 className="mb-3 font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{title}</h3>
    <p className="text-sm font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p>
  </motion.div>
);

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-bg-hero min-h-screen overflow-x-hidden font-sans transition-colors duration-500 dark:bg-surface-dark">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle/60 bg-white/80 backdrop-blur-xl transition-colors duration-500 dark:border-neutral-800/60 dark:bg-surface-dark/80">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo iconSize={34} />
          </div>

          <div className="hidden items-center gap-9 md:flex">
            {["Fitur", "Cara Kerja", "Harga"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-semibold text-neutral-600 transition-colors hover:text-accent-blue dark:text-neutral-300 dark:hover:text-accent-blue-light"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 focus-ring dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login" className="hidden text-sm font-semibold text-neutral-700 transition-colors hover:text-accent-blue dark:text-neutral-300 dark:hover:text-accent-blue-light sm:block">
              Masuk
            </Link>
            <Link to="/register" className={btn("primary", "md", "shadow-soft")}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-36">
        <div className="pointer-events-none absolute -right-72 -top-72 h-[700px] w-[700px] rounded-full bg-accent-blue/10 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-violet/10 blur-[110px]" />

        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <Badge variant="primary" className="mb-6 px-3.5 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Solusi AI untuk UMKM Indonesia 🇮🇩
              </Badge>

              <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-neutral-900 md:text-5xl dark:text-white">
                Chatbot Pintar <span className="text-gradient">Otomatis</span> Untuk Bisnis Anda
              </h1>

              <p className="mb-10 max-w-lg text-base font-medium leading-relaxed text-neutral-500 dark:text-neutral-300">
                Tingkatkan layanan pelanggan Anda tanpa biaya mahal. JagoBot membantu UMKM
                mengotomatisasi tanya jawab dan pesanan 24/7.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Link to="/register" className={btn("primary", "lg", "shadow-lift w-full sm:w-auto px-8")}>
                  Mulai Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className={btn("secondary", "lg", "w-full sm:w-auto px-8")}>
                  Lihat Demo
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-5">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-soft dark:border-neutral-800"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Bergabung dengan <span className="font-bold text-accent-blue dark:text-accent-blue-light">2,000+</span> UMKM lainnya
                </p>
              </div>
            </motion.div>

            {/* Mockup chat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-border-subtle bg-white shadow-pop dark:border-neutral-800 dark:bg-neutral-900">
                {/* Header browser */}
                <div className="flex items-center gap-1.5 border-b border-border-subtle bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-pink/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-orange/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-green/70" />
                  <span className="ml-3 flex-1 truncate rounded-lg bg-white px-3 py-1 text-[10px] font-medium text-neutral-400 dark:bg-neutral-900">
                    tokoberkah.com
                  </span>
                </div>

                {/* Header chat */}
                <div className="flex items-center justify-between border-b border-border-subtle bg-gradient-to-r from-brand-blue to-brand-navy px-5 py-4 dark:from-brand-blue dark:to-brand-navy">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">JagoBot Assistant</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bubble chat */}
                <div className="space-y-3.5 bg-surface/60 p-6 dark:bg-neutral-950/40">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-border-subtle bg-white px-4 py-3 text-xs font-medium text-neutral-700 shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    Halo! Selamat datang di Warung Berkah. Ada yang bisa saya bantu?
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-gradient-to-br from-accent-blue to-accent-violet px-4 py-3 text-xs font-medium text-white shadow-soft">
                    Berapa harga Kopi Gayo hari ini?
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border-subtle bg-white px-4 py-3 text-xs font-medium text-neutral-700 shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    Harga Kopi Gayo hari ini Rp 85.000 per 250gr, Kak. Sedang ada promo beli 2 gratis 1! ☕️
                  </div>
                </div>

                {/* Input palsu */}
                <div className="flex gap-2 border-t border-border-subtle bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex-1 rounded-xl bg-neutral-50 px-4 py-2.5 text-[11px] font-medium text-neutral-400 dark:bg-neutral-800">
                    Ketik pesan...
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet text-white">
                    <ArrowRight className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-border-subtle bg-white p-3.5 shadow-card dark:border-neutral-800 dark:bg-neutral-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Respon Cepat</p>
                  <p className="text-xs font-bold text-neutral-800 dark:text-white">&lt; 1 Detik</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="relative z-10 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            Bagian dari Ekosistem JagoAI
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            <img src="/JagoNota.png" alt="JagoNota" className="h-16 w-auto object-contain opacity-80 transition-transform hover:scale-105 dark:opacity-90" />
            <img src="/JagoCV.png" alt="JagoCV" className="h-16 w-auto object-contain opacity-80 transition-transform hover:scale-105 dark:opacity-90" />
          </div>
        </div>
      </div>

      {/* Fitur */}
      <section id="fitur" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <Badge variant="primary" className="mb-4">Fitur Unggulan</Badge>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
              Teknologi AI Masa Depan
            </h2>
            <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">
              Kami menghadirkan teknologi tercanggih yang dikemas dalam antarmuka yang sangat mudah
              digunakan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Bot}
              title="AI Chatbot Cerdas"
              description="Menggunakan teknologi LLM terbaru untuk memahami konteks percakapan pelanggan dengan akurasi tinggi."
            />
            <FeatureCard
              icon={Globe}
              title="Cloud Technology"
              description="Akses chatbot Anda dari mana saja, kapan saja. Data tersimpan aman di cloud global."
            />
            <FeatureCard
              icon={Zap}
              title="Customer Support 24/7"
              description="Jangan biarkan pelanggan menunggu. Bot kami siap melayani pesanan dan pertanyaan setiap saat."
            />
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <Badge variant="primary" className="mb-4">Harga Transparan</Badge>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
              Pilih Paket Sesuai Kebutuhan
            </h2>
            <p className="mx-auto max-w-xl text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Mulai dari gratis hingga paket kustom untuk bisnis yang berkembang pesat.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Gratis",
                price: "Rp 0",
                desc: "Cocok untuk mencoba",
                features: ["70 Chat / Bulan", "1 Knowledge Base", "Integrasi Website", "Support Komunitas"],
              },
              {
                name: "Pro",
                price: "Rp 149rb",
                desc: "Paling populer untuk UMKM",
                features: ["Unlimited Chat", "10 Knowledge Base", "Integrasi WhatsApp", "Upload Dokumen (PDF/Doc)", "Analitik Lengkap"],
                popular: true,
              },
              {
                name: "Premium",
                price: "Rp 499rb",
                desc: "Untuk skala besar",
                features: ["Semua Fitur Pro", "API Access", "Custom Branding", "Multi-Admin Dashboard", "Dedicated Support 24/7"],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative rounded-3xl border p-8 transition-all duration-300",
                  plan.popular
                    ? "z-10 border-accent-blue/40 bg-white shadow-card ring-1 ring-accent-blue/20 md:-translate-y-2 dark:bg-neutral-900"
                    : "border-border-subtle bg-white shadow-soft hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900/60"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-blue to-accent-violet px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-soft">
                    Paling Populer
                  </div>
                )}
                <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                <p className="mb-6 mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">{plan.desc}</p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">/bulan</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={btn(plan.popular ? "primary" : "secondary", "md", "w-full")}
                >
                  Pilih Paket
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <Badge variant="primary" className="mb-4">Cara Kerja</Badge>
              <h2 className="mb-10 font-display text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
                Cara Kerja JagoBot
              </h2>

              <div className="space-y-8">
                {[
                  { step: "01", title: "Daftar & Buat Akun", desc: "Hanya butuh 2 menit untuk memulai perjalanan AI Anda." },
                  { step: "02", title: "Latih Bot Anda", desc: "Unggah daftar harga, jam buka, dan info produk Anda." },
                  { step: "03", title: "Atur Profil Bot", desc: "Pilih gaya bahasa yang sesuai dengan brand toko Anda." },
                  { step: "04", title: "Hubungkan & Selesai", desc: "Aktifkan di WhatsApp atau Website dan biarkan bot bekerja." },
                ].map((item) => (
                  <div key={item.step} className="group flex items-start gap-6">
                    <span className="font-display text-3xl font-extrabold leading-none text-accent-blue/25 transition-colors duration-300 group-hover:text-accent-blue dark:text-accent-blue-light/25 dark:group-hover:text-accent-blue-light">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="mb-1.5 font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid panel gambar */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-accent-blue/5 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4 p-4 sm:gap-5 sm:p-5">
                {[
                  { img: "/panel1.png", label: "1. Proses Mudah" },
                  { img: "/panel2.png", label: "2. Input Data" },
                  { img: "/panel3.png", label: "3. Personalisasi" },
                  { img: "/panel4.png", label: "4. Live & Responsif" },
                ].map((panel, idx) => (
                  <div
                    key={idx}
                    className="group overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={panel.img}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={panel.label}
                      />
                    </div>
                    <div className="border-t border-border-subtle bg-white py-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                        {panel.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-transparent bg-gradient-to-br from-brand-blue to-brand-navy p-10 text-center shadow-card relative md:p-16">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-blue/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-violet/25 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Siap Membuat Bisnis Anda Lebih Jago?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base font-medium leading-relaxed text-blue-100/90">
              Bergabunglah dengan ribuan UMKM lainnya yang telah menggunakan JagoBot untuk meningkatkan
              efisiensi layanan pelanggan.
            </p>
            <Link
              to="/register"
              className={btn("dark", "lg", "px-9 shadow-lift hover:shadow-xl")}
            >
              Mulai Gratis Sekarang <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-10 dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo iconSize={32} />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © 2026 JagoBot Indonesia. Semua hak dilindungi.
          </p>
          <div className="flex gap-7">
            {["Twitter", "Instagram", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs font-semibold text-neutral-500 transition-colors hover:text-accent-blue dark:text-neutral-400 dark:hover:text-accent-blue-light"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
