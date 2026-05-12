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
  X,
  Bot,
  Sun,
  Moon,
  RefreshCw,
  ChevronDown,
  Plus,
  HelpCircle
} from "lucide-react";
import { getUserBots, createProject } from "../lib/api";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative",
      active
        ? "bg-[#1800ad] text-white shadow-lg shadow-[#1800ad]/20"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-4.5 h-4.5 transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
    <span className={cn("font-semibold text-xs tracking-tight", active ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>{label}</span>
  </Link>
);

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
        const response = await getUserBots();
        const bots = response.data;
        setUserBots(bots);
        
        if (!localStorage.getItem('activeBotId') && bots.length > 0) {
          const firstBotId = bots[0].id.toString();
          localStorage.setItem('activeBotId', firstBotId);
          setActiveBotId(firstBotId);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar bot:", error);
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
      const newBotId = response.data.bot.id.toString();
      
      localStorage.setItem('activeBotId', newBotId);
      setActiveBotId(newBotId);
      setIsModalOpen(false);
      setNewBotName("");
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Gagal membuat project:", error);
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
    { icon: BarChart3, label: "Analitik", href: "/dashboard/analytics" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 flex overflow-hidden">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] dark:from-slate-950 dark:to-slate-900 text-white transition-transform duration-500 ease-in-out transform lg:translate-x-0 border-r border-white/5 dark:border-slate-800 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center px-6 py-10">
          <Logo iconSize={40} textSize="text-2xl" />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar scrollbar-hide">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-3">Menu Utama</p>
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

        <div className="p-4 border-t border-white/5 mt-auto">
          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
            <span className="font-semibold text-xs tracking-tight">Pusat Bantuan</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
          <button
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 mr-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 lg:flex hidden items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/50 mr-4">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">System Online</span>
            </div>
            <h1 className="text-md font-bold tracking-tight text-[#1800ad] dark:text-white uppercase">
              {menuItems.find(item => item.href === location.pathname)?.label || "Dashboard"}
            </h1>

            {userBots.length > 0 && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Project:</span>
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <select
                      value={activeBotId || ''}
                      onChange={(e) => handleProjectSwitch(e.target.value)}
                      className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#1800ad] dark:text-blue-400 py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer hover:border-[#1800ad]/30 transition-all shadow-sm min-w-[140px]"
                    >
                      {userBots.map((bot) => (
                        <option key={bot.id} value={bot.id.toString()}>
                          {bot.nama_bot}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none transition-transform group-hover:text-[#1800ad]" />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shrink-0"
                    title="Tambah Project Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Help Center"
              >
                <HelpCircle size={18} />
              </button>

              {isHelpOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsHelpOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#1800ad] dark:text-white">Pusat Bantuan</h3>
                      <p className="text-[9px] text-slate-400 font-medium">Kami siap membantu Anda</p>
                    </div>
                    
                    <a
                      href="https://wa.me/628123456789"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#1800ad] transition-all"
                    >
                      <MessageSquare size={14} className="text-emerald-500" />
                      Chat WhatsApp Support
                    </a>

                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#1800ad] transition-all"
                    >
                      <Database size={14} className="text-blue-500" />
                      Dokumentasi JagoBot
                    </a>

                    <a
                      href="mailto:support@jagobot.com"
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#1800ad] transition-all"
                    >
                      <RefreshCw size={14} className="text-amber-500" />
                      Kirim Tiket Bantuan
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#1800ad] dark:text-white">Notifikasi Masuk</h3>
                      <Link to="/dashboard/notifications?tab=settings" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] font-bold text-slate-400 hover:text-[#1800ad]">Pengaturan</Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Ada Pesan Baru!</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">Pelanggan menanyakan harga produk...</p>
                          <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">Baru saja</p>
                        </div>
                      ))}
                    </div>
                    <Link 
                      to="/dashboard/notifications" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      Lihat Semua Notifikasi
                    </Link>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mr-2"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-[#1800ad] dark:text-white uppercase leading-none mb-1">
                    {profile.toko}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none">
                    {profile.nama}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-lg bg-[#1800ad] flex items-center justify-center text-white font-bold text-[10px] uppercase shadow-md relative group-hover:scale-105 transition-transform">
                  {profile.toko && profile.toko.trim() !== ""
                    ? profile.toko.split(' ').map(n => n[0]).join('').substring(0, 2)
                    : "JB"}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">{profile.toko}</p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest truncate">{profile.nama}</p>
                    </div>
                    
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#1800ad] transition-all"
                    >
                      <User size={14} />
                      Profil Saya
                    </Link>
                    
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                    
                    <button
                      onClick={() => {
                        localStorage.clear();
                        navigate("/");
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full text-left"
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

        <main className={cn("flex-1 custom-scrollbar", location.pathname === "/dashboard/playground" ? "p-0 overflow-hidden" : "p-6 lg:p-8 overflow-y-auto")}>
          <div className={cn("mx-auto", location.pathname === "/dashboard/playground" ? "max-w-none h-full" : "max-w-7xl")}>
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {isSwitching && (
        <div className="fixed inset-0 z-[100] bg-[#0f172a]/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="mt-6 text-sm font-bold text-white uppercase tracking-[0.3em] animate-pulse">Berpindah Project...</p>
          <p className="mt-2 text-[10px] text-slate-400 font-medium">Menyiapkan Knowledge Base & Statistik...</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Buat Project Baru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Masukkan nama untuk project UMKM Anda yang baru</p>
            </div>

            <form onSubmit={handleCreateBot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Nama Project</label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="Misal: Toko Online Aku"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 outline-none transition-all"
                  disabled={isCreatingBot}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewBotName("");
                  }}
                  disabled={isCreatingBot}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBot || !newBotName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#1800ad] text-white font-semibold text-sm hover:bg-[#1400a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingBot ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Buat Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
