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
  Moon
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

// 1. Optimasi ukuran padding dan gap pada SidebarItem
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
    <span className={cn("font-bold text-xs tracking-tight", active ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>{label}</span>
  </Link>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    nama: "User",
    toko: "JagoAI Store"
  });

  useEffect(() => {
    const fetchProfile = () => {
      try {
        const savedStore = localStorage.getItem('nama_toko');
        const rawUser = localStorage.getItem('user');
        const userData = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : {};

        setProfile({
          nama: userData.nama || "User Jago",
          toko: savedStore || "JagoAI Store"
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile({ nama: "User Jago", toko: "JagoAI Store" });
      }
    };

    fetchProfile();
    window.addEventListener('storage', fetchProfile);
    return () => window.removeEventListener('storage', fetchProfile);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
    { icon: Bot, label: "Kepribadian Bot", href: "/dashboard/personality" },
    { icon: MessageSquare, label: "Playground", href: "/dashboard/playground" },
    { icon: Settings, label: "Integrasi", href: "/dashboard/integration" },
    { icon: BarChart3, label: "Analitik", href: "/dashboard/analytics" },
  ];

  const bottomItems = [
    { icon: User, label: "Profil Saya", href: "/dashboard/profile" },
    { icon: Bell, label: "Notifikasi", href: "/dashboard/notifications" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] dark:from-slate-950 dark:to-slate-900 text-white transition-transform duration-500 ease-in-out transform lg:translate-x-0 border-r border-white/5 dark:border-slate-800",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 2. Mengurangi padding container utama sidebar */}
        <div className="flex flex-col h-full p-4">

          {/* 3. Optimasi Logo: Dibuat ke tengah dengan justify-center */}
          <div className="flex items-center justify-center w-full px-2 mb-6 mt-2">
            <img
              src="/Logo_JagoAI.png"
              alt="JagoBot Logo"
              className="h-30 w-auto object-contain" // Ukuran h-10 lebih proporsional untuk sidebar w-60
            />
          </div>

          {/* 4. Spacing antar menu dipersempit (space-y-1) */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
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

          {/* 5. Bagian bawah dibuat lebih compact */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
            {bottomItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location.pathname === item.href}
              />
            ))}
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              // Penyesuaian: bg tetap transparan (hover:bg-white/5 atau clear), teks jadi putih
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all w-full text-left group"
            >
              {/* Ikon berubah ke warna biru #1800ad saat hover sebagai aksen */}
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-[#1800ad]" />
              <span className="font-bold text-xs tracking-tight">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 6. Penyesuaian margin konten utama agar pas dengan lebar sidebar baru */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors duration-300">
          <button
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 lg:flex hidden">
            <h1 className="text-md font-black tracking-tight text-[#1800ad] dark:text-white uppercase">
              {menuItems.find(item => item.href === location.pathname)?.label ||
                bottomItems.find(item => item.href === location.pathname)?.label ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1800ad] dark:text-white uppercase leading-none mb-1">
                  {profile.toko}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none">
                  {profile.nama}
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#1800ad] flex items-center justify-center text-white font-black text-[10px] uppercase shadow-sm">
                {profile.toko && profile.toko.trim() !== ""
                  ? profile.toko.split(' ').map(n => n[0]).join('').substring(0, 2)
                  : "JB"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};