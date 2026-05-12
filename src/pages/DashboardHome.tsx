import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
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

{/* PENYESUAIAN: Background StatCard diubah menjadi semi-transparan (glass) agar kontras dengan latar putih abu-abu */ }
const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <div className="bg-brand-blue/95 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-white/20 dark:bg-white/10 rounded-xl shadow-inner">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
        isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
      )}>
        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">{title}</h3>
    <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
  </div>
);

export const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [period, setPeriod] = useState("bulan");

  const fetchData = async (currentPeriod: string, silent = false, isFilterChange = false) => {
    try {
      if (!silent && !isFilterChange) setLoading(true);
      if (isFilterChange) setIsChartLoading(true);
      if (silent) setIsRefreshing(true);

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
      setIsChartLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Jika data sudah ada, berarti ini adalah perubahan filter (period)
    const isFilterChange = !!dashboardData;
    fetchData(period, false, isFilterChange);
    
    const interval = setInterval(() => {
      fetchData(period, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [period]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 font-bold italic animate-pulse uppercase tracking-widest text-xs">
        Memuat Data JagoBot...
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const namaBotAktif = dashboardData?.nama_toko || "NAMA TOKO";
  const dynamicChartData = stats?.chartData?.length > 0 ? stats.chartData : data;

  return (
    /* PENYESUAIAN: Latar belakang diubah ke warna putih keabu-abuan yang smooth dengan gradasi halus */
    <div className="space-y-6 pb-8 min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-4 md:p-6 lg:p-8 rounded-[2.5rem]">
      <div className="flex justify-between items-center">
        {isRefreshing && (
          <div className="flex items-center gap-2 text-[#1800ad] animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Memperbarui...</span>
          </div>
        )}
      </div>

      <h2 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Ringkasan Statistik</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PENYESUAIAN: Card diubah sedikit lebih solid agar tetap terbaca jelas di background terang */}
        <div className="lg:col-span-2 bg-brand-blue p-6 rounded-[1.5rem] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-white uppercase tracking-tight">
                Aktivitas Chat: {namaBotAktif}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Statistik performa bot {period === 'bulan' ? 'bulan ini' : 'minggu ini'}</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white/10 dark:bg-slate-900/10 border border-white/10 text-[9px] font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 outline-none cursor-pointer text-white"
            >
              <option value="bulan" className="bg-brand-blue text-white">Bulan Ini</option>
              <option value="minggu" className="bg-brand-blue text-white">Minggu Ini</option>
            </select>
          </div>
          <div className="h-[280px] w-full relative">
            {isChartLoading && (
              <div className="absolute inset-0 z-10 bg-brand-blue/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">Menghitung Data...</span>
                </div>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicChartData}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1800ad" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1800ad" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="chats" stroke="#1800ad" fillOpacity={1} fill="url(#colorChats)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/10 shadow-xl">
          <h3 className="font-bold text-base text-white mb-6 uppercase tracking-tight">Top FAQ</h3>
          <div className="space-y-4">
            {[
              { q: "Berapa harga produk ini?", count: 452, trend: "+5%" },
              { q: "Apakah ada promo hari ini?", count: 321, trend: "+12%" },
              { q: "Bisa kirim ke luar kota?", count: 289, trend: "-2%" },
              { q: "Jam berapa toko buka?", count: 156, trend: "+1%" },
              { q: "Metode pembayaran apa saja?", count: 98, trend: "+8%" },
            ].map((faq, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-slate-900/10 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:bg-[#1800ad] group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{faq.q}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{faq.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-blue rounded-[1.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1800ad]/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/10 dark:bg-slate-900/10 rounded-full text-[9px] font-bold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Status: Aktif
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Bot {namaBotAktif} Sedang Bekerja!</h2>
          <p className="text-blue-100 max-w-sm text-xs leading-relaxed">
            JagoBot telah menangani {stats?.totalChat || 0} chat. Semua pelanggan terlayani dengan baik.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <button className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 dark:bg-slate-900/20 transition-all text-xs">
            Lihat Log Chat
          </button>
          <button className="bg-[#1800ad] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-[#1800ad]/20 text-xs">
            Tes Bot Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};