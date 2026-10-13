import {
  LayoutDashboard,
  Database,
  MessageSquare,
  Settings,
  BarChart3,
  User,
  Bell,
  LogOut,
  Menu,
  CreditCard,
  X,
  Bot,
  Sun,
  Moon,
  RefreshCw,
  ChevronDown,
  Plus,
  HelpCircle,
  KeyRound
} from "lucide-react";
import { getUserBots, createProject } from "../lib/api";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { Badge, Button, Input, Modal } from "./ui";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, active }) => (
  <Link
    to={href}
    className={cn(
      "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 focus-ring",
      active
        ? "bg-accent-blue/[0.08] text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light"
        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
    )}
  >
    {active && (
      <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-blue dark:bg-accent-blue-light" />
    )}
    <Icon
      className={cn(
        "h-4.5 w-4.5 shrink-0 transition-colors",
        active ? "text-accent-blue dark:text-accent-blue-light" : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
      )}
    />
    <span className={cn("text-xs font-semibold tracking-tight", active ? "text-accent-blue dark:text-accent-blue-light" : "text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-100")}>
      {label}
    </span>
  </Link>
);

/* Background gradient full-bleed per halaman (diterapkan di <main>, dipisah batas sidebar & header) */
const pageBgRoutes: Record<string, string> = {
  "/dashboard": "page-bg-dashboard",
  "/dashboard/knowledge": "page-bg-knowledge",
  "/dashboard/personality": "page-bg-personality",
  "/dashboard/integration": "page-bg-integration",
  "/dashboard/analytics": "page-bg-analytics",
  "/dashboard/profile": "page-bg-settings",
  "/dashboard/notifications": "page-bg-minimal",
  "/dashboard/payment": "page-bg-payment",
  "/dashboard/admin/payment": "page-bg-minimal",
  "/dashboard/playground": "page-bg-playground",
};

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [userBots, setUserBots] = useState<any[]>([]);
  const [activeBotId, setActiveBotId] = useState<string | null>(localStorage.getItem('activeBotId'));
  const [isSwitching, setIsSwitching] = useState(false);
  const [profile, setProfile] = useState<{ nama: string; toko: string }>({ nama: "Admin", toko: "Toko JagoBot" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  useEffect(() => {
    const fetchProfile = () => {
      try {
        const savedStore = localStorage.getItem('nama_toko');
        const rawUser = localStorage.getItem('user');
        const userData = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : {};

        setProfile({
          nama: userData.nama || "Admin",
          toko: savedStore || "Toko JagoBot"
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile({ nama: "Admin", toko: "Toko JagoBot" });
      }
    };

    const fetchBots = async () => {
      try {
        const bots = await getUserBots();
        const normalizedBots = Array.isArray(bots) ? bots : [];
        setUserBots(normalizedBots);

        const storedId = localStorage.getItem('activeBotId');

        if (normalizedBots.length > 0) {
          // Validasi: pastikan activeBotId yang tersimpan benar-benar ada di list bot user ini
          const isStoredIdValid = storedId && normalizedBots.some(b => b.id.toString() === storedId);

          if (!isStoredIdValid) {
            // activeBotId tidak valid (sisa sesi lama / user berbeda) → reset ke bot pertama
            const firstBotId = normalizedBots[0].id.toString();
            localStorage.setItem('activeBotId', firstBotId);
            setActiveBotId(firstBotId);
          } else {
            setActiveBotId(storedId);
          }
        }
      } catch (error) {
        console.error("🔴 [FetchBots] Gagal mengambil daftar bot:", error);
      }
    };

    fetchProfile();
    fetchBots();
    window.addEventListener('storage', fetchProfile);
    return () => window.removeEventListener('storage', fetchProfile);
  }, []);

  const handleProjectSwitch = (newId: string) => {
    setIsSwitching(true);
    localStorage.setItem('activeBotId', newId);
    setActiveBotId(newId);

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBotName.trim()) {
      alert("Nama project tidak boleh kosong");
      return;
    }

    setIsCreatingBot(true);
    try {
      const response = await createProject(newBotName);

      // Struktur respons bisa: { data: { bot: { id } } } atau { bot: { id } } atau { id }
      const newBotId = (response.data.data?.bot?.id || response.data.bot?.id || response.data.id).toString();

      localStorage.setItem('activeBotId', newBotId);
      setActiveBotId(newBotId);
      setIsModalOpen(false);
      setNewBotName("");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("🔴 [CreateBot] Error:", error);
      alert(error.response?.data?.message || "Gagal membuat project baru. Silakan coba lagi.");
    } finally {
      setIsCreatingBot(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
    { icon: Bot, label: "Profil Bot", href: "/dashboard/personality" },
    { icon: MessageSquare, label: "Playground", href: "/dashboard/playground" },
    { icon: Settings, label: "Integrasi", href: "/dashboard/integration" },
    { icon: KeyRound, label: "API", href: "/dashboard/api" },
    { icon: CreditCard, label: "Pembayaran", href: "/dashboard/payment" },
  ];

  // Judul + subjudul header per halaman
  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Dashboard", subtitle: "Kelola chatbot bisnis Anda" },
    "/dashboard/knowledge": { title: "Knowledge Base", subtitle: "Latih bot dengan pengetahuan toko Anda" },
    "/dashboard/personality": { title: "Profil Bot", subtitle: "Atur gaya bicara & kepribadian bot" },
    "/dashboard/playground": { title: "Playground", subtitle: "Uji coba respon bot Anda" },
    "/dashboard/integration": { title: "Integrasi", subtitle: "Hubungkan channel komunikasi bisnis" },
    "/dashboard/api": { title: "Manajemen API", subtitle: "Kelola kunci API untuk integrasi eksternal" },
    "/dashboard/analytics": { title: "Analitik", subtitle: "Pantau performa chatbot Anda" },
    "/dashboard/payment": { title: "Pembayaran", subtitle: "Kelola paket & langganan Anda" },
  };
  const currentMeta = pageMeta[location.pathname] || {
    title: menuItems.find((item) => item.href === location.pathname)?.label || "Dashboard",
    subtitle: "Kelola chatbot bisnis Anda",
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-surface transition-colors duration-300 dark:bg-surface-dark">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-subtle bg-white text-neutral-800 transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center px-6 pb-6 pt-8">
          <Logo iconSize={38} />
        </div>

        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-4">
          <p className="mb-3 ml-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Menu Utama
          </p>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={location.pathname === item.href}
            />
          ))}
        </nav>

        {/* Kartu Pusat Bantuan */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-accent-blue/15 bg-accent-blue/[0.04] p-4 dark:border-accent-blue/20 dark:bg-accent-blue/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-accent-blue shadow-soft dark:bg-neutral-800 dark:text-accent-blue-light">
                <HelpCircle className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Pusat Bantuan</p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Butuh bantuan tim JagoBot? Kami siap membantu Anda.
            </p>
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-white py-2 text-xs font-semibold text-accent-blue shadow-soft transition-all hover:bg-neutral-50 focus-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-accent-blue-light dark:hover:bg-neutral-700"
            >
              Hubungi Support
            </a>
          </div>
        </div>
      </aside>

      {/* ── Area konten ─────────────────────────────────────── */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:ml-64">
        <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-border-subtle bg-white/80 px-4 py-3 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-surface-dark/80 lg:px-6">
          <button
            className="mr-2 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 focus-ring dark:text-neutral-300 dark:hover:bg-neutral-800 lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden flex-1 items-center gap-4 lg:flex">
            <div>
              <h1 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                {currentMeta.title}
              </h1>
              <p className="text-[11px] font-medium text-neutral-400">{currentMeta.subtitle}</p>
            </div>

            <div className="ml-2 flex items-center gap-2 border-l border-border-subtle pl-4 dark:border-neutral-800">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Project
              </span>
              <div className="relative">
                <select
                  value={activeBotId || ''}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue === 'new_project') {
                      setIsModalOpen(true);
                      return;
                    }
                    handleProjectSwitch(selectedValue);
                  }}
                  className="min-w-[180px] cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-neutral-800 shadow-soft outline-none transition-all hover:shadow-hover-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {userBots.length === 0 && (
                    <option value="" disabled>
                      Belum ada project
                    </option>
                  )}
                  {userBots.map((bot) => (
                    <option key={bot.id} value={bot.id.toString()}>
                      {bot.nama_bot}
                    </option>
                  ))}
                  <option value="new_project" className="font-semibold text-accent-blue">
                    + Tambah Project Baru
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-accent-blue/25 bg-accent-blue/5 p-2 text-accent-blue shadow-soft transition-colors hover:bg-accent-blue/10 focus-ring dark:border-accent-blue/30 dark:bg-accent-blue/15 dark:text-accent-blue-light"
                title="Tambah Project Baru"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status online */}
            <Badge variant="success" dot pulseDot className="mr-1 hidden md:inline-flex">
              Online
            </Badge>

            {/* Pusat Bantuan */}
            <div className="relative">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="rounded-xl border border-transparent p-2 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800 hover:shadow-soft focus-ring dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                title="Help Center"
              >
                <HelpCircle size={18} />
              </button>

              {isHelpOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsHelpOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-border-subtle bg-white py-2 shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-2 border-b border-border-subtle px-4 py-3 dark:border-neutral-800">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Pusat Bantuan</h3>
                      <p className="mt-0.5 text-[11px] text-neutral-400">Kami siap membantu Anda</p>
                    </div>

                    <a
                      href="https://wa.me/628123456789"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                    >
                      <MessageSquare size={14} className="text-accent-green" />
                      Chat WhatsApp Support
                    </a>

                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                    >
                      <Database size={14} className="text-accent-blue" />
                      Dokumentasi JagoBot
                    </a>

                    <a
                      href="mailto:support@jagobot.com"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                    >
                      <RefreshCw size={14} className="text-accent-orange" />
                      Kirim Tiket Bantuan
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Notifikasi */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-xl border border-transparent p-2 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800 hover:shadow-soft focus-ring dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-accent-pink dark:border-surface-dark" />
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-border-subtle p-4 dark:border-neutral-800">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Notifikasi Masuk</h3>
                      <Link to="/dashboard/notifications?tab=settings" onClick={() => setIsNotificationsOpen(false)} className="text-[11px] font-semibold text-accent-blue hover:underline">
                        Pengaturan
                      </Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {[1, 2].map((i) => (
                        <div key={i} className="cursor-pointer border-b border-border-subtle/60 p-4 transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40">
                          <p className="mb-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-100">Ada Pesan Baru!</p>
                          <p className="line-clamp-1 text-[11px] text-neutral-500 dark:text-neutral-400">Pelanggan menanyakan harga produk...</p>
                          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">Baru saja</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block border-t border-border-subtle p-3 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-800/40 dark:hover:text-neutral-200"
                    >
                      Lihat Semua Notifikasi
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-transparent p-2 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800 hover:shadow-soft focus-ring dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Profil */}
            <div className="relative ml-1">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-xl py-1 pl-3 transition-colors hover:bg-neutral-50 focus-ring dark:hover:bg-neutral-800/60"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold leading-tight text-neutral-900 dark:text-white">
                    {profile.toko}
                  </p>
                  <p className="text-[10px] font-medium leading-tight text-neutral-400">
                    {profile.nama}
                  </p>
                </div>

                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet text-[11px] font-bold uppercase text-white shadow-soft">
                  {profile.toko && profile.toko.trim() !== ""
                    ? profile.toko.split(' ').map(n => n[0]).join('').substring(0, 2)
                    : "JB"}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-accent-green dark:border-surface-dark" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border-subtle bg-white py-2 shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-2 border-b border-border-subtle px-4 py-3 dark:border-neutral-800">
                      <p className="truncate text-xs font-bold text-neutral-900 dark:text-white">{profile.toko}</p>
                      <p className="truncate text-[11px] font-medium text-neutral-400">{profile.nama}</p>
                    </div>

                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                    >
                      <User size={14} />
                      Profil Saya
                    </Link>

                    <div className="mx-2 my-1 h-px bg-border-subtle dark:bg-neutral-800" />

                    <button
                      onClick={() => {
                        localStorage.clear();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-accent-pink transition-all hover:bg-accent-pink/10"
                    >
                      <LogOut size={14} />
                      Logout / Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 custom-scrollbar",
          pageBgRoutes[location.pathname] || "page-bg-minimal",
          location.pathname === "/dashboard/playground" ? "overflow-hidden p-0" : "overflow-y-auto p-4 lg:p-8"
        )}>
          <div className={cn("mx-auto", location.pathname === "/dashboard/playground" ? "flex h-full max-w-none items-center justify-center p-5" : "max-w-7xl")}>
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Overlay berpindah project */}
      {isSwitching && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-navy/80 backdrop-blur-md transition-all duration-500">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/15 border-t-accent-blue-light"></div>
            <RefreshCw className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse text-accent-blue-light" />
          </div>
          <p className="mt-6 animate-pulse text-sm font-bold uppercase tracking-[0.3em] text-white">Berpindah Project...</p>
          <p className="mt-2 text-xs font-medium text-slate-400">Menyiapkan Knowledge Base & Statistik...</p>
        </div>
      )}

      {/* Modal buat project baru */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewBotName("");
        }}
        title="Buat Project Baru"
        description="Masukkan nama untuk project UMKM Anda yang baru"
        icon={Plus}
      >
        <form onSubmit={handleCreateBot} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nama Project</label>
            <Input
              type="text"
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              placeholder="Misal: Toko Online Aku"
              disabled={isCreatingBot}
              autoFocus
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setNewBotName("");
              }}
              disabled={isCreatingBot}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreatingBot || !newBotName.trim()}>
              {isCreatingBot ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Buat Project
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
