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
import { motion } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  key?: string;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
      active
        ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
    <span className={cn("font-bold text-sm tracking-tight", active ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>{label}</span>
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

        // Perbaikan: Gunakan Try-Catch untuk parse JSON agar tidak blank screen
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
    <div className="min-h-screen bg-white transition-colors duration-300">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-brand-blue text-white transition-transform duration-500 ease-in-out transform lg:translate-x-0 border-r border-white/5",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center shadow-xl shadow-brand-orange/30 rotate-3">
              <Bot className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter italic">JagoBot</span>
          </div>

          <nav className="flex-1 space-y-1.5">
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

          <div className="pt-5 mt-5 border-t border-white/10 space-y-1.5">
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left group"
            >
              <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
              <span className="font-bold text-sm tracking-tight">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <button
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="flex-1 lg:flex hidden">
            <h1 className="text-lg font-black tracking-tight text-brand-blue uppercase">
              {menuItems.find(item => item.href === location.pathname)?.label ||
                bottomItems.find(item => item.href === location.pathname)?.label ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-blue uppercase">
                  {profile.toko}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {profile.nama}
                </p>
              </div>

              {/* Perbaikan: Tambahkan Null Check pada split() agar tidak crash */}
              <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white font-black text-xs uppercase">
                {profile.toko && profile.toko.trim() !== ""
                  ? profile.toko.split(' ').map(n => n[0]).join('').substring(0, 2)
                  : "JB"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10 max-w-7xl mx-auto w-full">
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