import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw // Tambahkan icon ini untuk indikator refresh
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "../lib/utils";
import { getDashboardStats, getActiveBot } from "../lib/api";

const data = [
  { name: "Sen", chats: 400, orders: 240 },
  { name: "Sel", chats: 300, orders: 139 },
  { name: "Rab", chats: 200, orders: 980 },
  { name: "Kam", chats: 278, orders: 390 },
  { name: "Jum", chats: 189, orders: 480 },
  { name: "Sab", chats: 239, orders: 380 },
  { name: "Min", chats: 349, orders: 430 },
];

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white/10 rounded-2xl">
        <Icon className="w-6 h-6 text-brand-orange" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter",
        isPositive ? "bg-brand-orange/20 text-brand-orange" : "bg-red-500/20 text-red-400"
      )}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-white mt-1">{value}</p>
  </div>
);

export const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State baru untuk auto-refresh
  const [period, setPeriod] = useState("bulan");

  const fetchData = async (currentPeriod: string, silent = false) => {
    try {
      if (!silent) setLoading(true); // Hanya tampilkan loading besar jika bukan auto-refresh
      if (silent) setIsRefreshing(true); // Aktifkan indikator kecil jika sedang polling

      const botResponse = await getActiveBot();
      const activeBot = botResponse.data;

      if (activeBot && activeBot.id) {
        const response = await getDashboardStats(activeBot.id, currentPeriod);
        setDashboardData({ ...response.data, activeBotId: activeBot.id });
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Jalankan fetch pertama kali
    fetchData(period);

    // Set Interval untuk Auto-Refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchData(period, true); // Kirim flag 'true' agar tidak muncul loading besar
    }, 30000);

    // Membersihkan interval saat komponen tidak digunakan
    return () => clearInterval(interval);
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white font-black italic animate-pulse uppercase tracking-widest">
        Memuat Data JagoAI...
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const namaBotAktif = dashboardData?.nama_toko || "TOKO SAYA";
  const dynamicChartData = stats?.chartData?.length > 0 ? stats.chartData : data;

  return (
    <div className="space-y-8 pb-10">
      {/* Header dengan Indikator Auto-Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Ringkasan Statistik</h2>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-brand-orange animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Memperbarui...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Chat"
          value={stats?.totalChat?.toLocaleString() || "0"}
          change={stats?.chatTrend || "0%"}
          isPositive={stats?.isChatPositive}
          icon={MessageSquare}
        />
        <StatCard
          title="Pelanggan Baru"
          value={stats?.pelangganBaru?.toLocaleString() || "0"}
          change="+8.2%"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Tingkat Konversi"
          value={stats?.tingkatKonversi || "0%"}
          change="-2.4%"
          isPositive={false}
          icon={TrendingUp}
        />
        <StatCard
          title="Waktu Respon"
          value={stats?.avgResponse || "0.0s"}
          change="-15%"
          isPositive={true}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-blue p-8 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                Aktivitas Chat: {namaBotAktif}
              </h3>
              <p className="text-sm text-slate-400 font-medium">Statistik performa bot {period === 'bulan' ? 'bulan ini' : 'minggu ini'}</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer text-white"
            >
              <option value="bulan" className="bg-brand-blue">Bulan Ini</option>
              <option value="minggu" className="bg-brand-blue">Minggu Ini</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicChartData}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', padding: '16px', fontWeight: 'bold', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="chats" stroke="#FF6B35" fillOpacity={1} fill="url(#colorChats)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-blue p-8 rounded-[2rem] border border-white/5 shadow-xl">
          <h3 className="font-black text-lg text-white mb-8 uppercase tracking-tight">Top FAQ</h3>
          <div className="space-y-5">
            {[
              { q: "Berapa harga produk ini?", count: 452, trend: "+5%" },
              { q: "Apakah ada promo hari ini?", count: 321, trend: "+12%" },
              { q: "Bisa kirim ke luar kota?", count: 289, trend: "-2%" },
              { q: "Jam berapa toko buka?", count: 156, trend: "+1%" },
              { q: "Metode pembayaran apa saja?", count: 98, trend: "+8%" },
            ].map((faq, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-brand-orange group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{faq.q}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{faq.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-blue rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl shadow-brand-blue/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl -mr-40 -mt-40" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Status: Aktif
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Bot {namaBotAktif} Sedang Bekerja! 🚀</h2>
          <p className="text-blue-100 max-w-md text-sm leading-relaxed">
            JagoBot telah menangani {stats?.totalChat || 0} chat. Semua pelanggan terlayani dengan baik.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all text-sm">
            Liat Log Chat
          </button>
          <button className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-brand-orange/20 text-sm">
            Tes Bot Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};