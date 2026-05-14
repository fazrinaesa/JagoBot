import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, Calendar, Filter, TrendingUp, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { getAnalyticsStats, getActiveBot } from "../lib/api";

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("bulan");

  const fetchData = async () => {
    try {
      const storedBotId = localStorage.getItem('activeBotId');
      let resolvedBotId: number | null = null;

      if (storedBotId) {
        resolvedBotId = Number(storedBotId);
      } else {
        const botResponse = await getActiveBot();
        const activeBot = botResponse.data;
        if (activeBot && activeBot.id) {
          resolvedBotId = activeBot.id;
          localStorage.setItem('activeBotId', String(resolvedBotId));
        }
      }

      if (resolvedBotId) {
        const response = await getAnalyticsStats(resolvedBotId, period);
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal ambil data analitik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Polling tiap 30 detik
    return () => clearInterval(interval);
  }, [period]);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold italic animate-pulse uppercase tracking-widest text-xs">
        Memuat Data Analitik...
      </div>
    );
  }

  const chatData = analyticsData?.chatData || [];
  const sourceData = analyticsData?.sourceData || [];
  
  const totalChats = analyticsData?.totalChats || 0;
  const completionRate = analyticsData?.completionRate || "0%";
  const responseTime = analyticsData?.responseTime || "0.0s";

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-blue dark:text-white uppercase tracking-tighter">Analitik Performa</h2>
          <p className="text-slate-400 text-[11px] font-medium">Pantau bagaimana JagoBot membantu bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer text-brand-blue shadow-sm"
          >
            <option value="bulan">Bulan Ini</option>
            <option value="minggu">Minggu Ini</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1800ad] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#1800ad]/30">
            <Download className="w-3.5 h-3.5" /> Ekspor
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Percakapan", value: totalChats.toLocaleString(), icon: MessageCircle, mobileVisible: true },
          { label: "Tingkat Penyelesaian", value: completionRate, icon: CheckCircle, mobileVisible: true },
          { label: "Waktu Respon", value: responseTime, icon: Clock, mobileVisible: true },
          { label: "Kepuasan Pelanggan", value: "N/A", icon: TrendingUp, mobileVisible: false },
        ].map((stat, idx) => (
          <div key={idx} className={cn(
            "bg-brand-blue p-4 rounded-2xl border border-white/5 shadow-xl group hover:shadow-2xl transition-all duration-300",
            !stat.mobileVisible && "hidden sm:block"
          )}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/20 dark:bg-slate-900/10 text-white shadow-sm border border-white/10 group-hover:bg-[#1800ad] group-hover:text-white transition-all">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
            <p className="text-xl font-bold text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-brand-blue p-5 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1800ad]" /> Volume Chat Harian
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', padding: '10px', color: '#fff', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="chats" fill="#1800ad" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-brand-blue p-5 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-tight">Sumber Chat</h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sourceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', color: '#fff', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-white">100%</p>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {sourceData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 dark:bg-slate-900/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-[#1800ad]">{item.value}%</span>
              </div>
            ))}
            {sourceData.length === 0 && (
              <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest py-2">
                Belum ada data sumber
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};