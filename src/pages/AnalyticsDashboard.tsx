import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, Calendar, Filter, TrendingUp, MessageCircle, Clock, CheckCircle } from "lucide-react";

const chatData = [
  { name: "01 Mar", chats: 120 },
  { name: "02 Mar", chats: 150 },
  { name: "03 Mar", chats: 200 },
  { name: "04 Mar", chats: 180 },
  { name: "05 Mar", chats: 250 },
  { name: "06 Mar", chats: 300 },
  { name: "07 Mar", chats: 280 },
];

const sourceData = [
  { name: "WhatsApp", value: 65, color: "#10b981" },
  { name: "Website", value: 25, color: "#1800ad" }, // Warna diganti ke #1800ad
  { name: "Lainnya", value: 10, color: "#94a3b8" },
];

export const AnalyticsDashboard = () => {
  return (
    // Penyesuaian: space-y-8 -> space-y-5
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Penyesuaian: text-3xl -> text-xl */}
          <h2 className="text-xl font-black text-brand-blue dark:text-white uppercase tracking-tighter">Analitik Performa</h2>
          <p className="text-slate-400 text-[11px] font-medium">Pantau bagaimana JagoBot membantu bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Penyesuaian: px-5 py-3 -> px-4 py-2, text-xs -> text-[10px] */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-brand-blue dark:text-white hover:bg-slate-50 dark:bg-slate-800/50 transition-all uppercase tracking-widest shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#1800ad]" /> 1 Mar - 7 Mar 2026
          </button>
          {/* Penyesuaian: bg-brand-orange -> bg-[#1800ad] */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1800ad] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#1800ad]/30">
            <Download className="w-3.5 h-3.5" /> Ekspor Laporan
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {/* Penyesuaian: gap-6 -> gap-4 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Percakapan", value: "1,480", icon: MessageCircle },
          { label: "Tingkat Penyelesaian", value: "94%", icon: CheckCircle },
          { label: "Waktu Respon", value: "0.8s", icon: Clock },
          { label: "Kepuasan Pelanggan", value: "4.8/5", icon: TrendingUp },
        ].map((stat, idx) => (
          // Penyesuaian: p-6 -> p-4, rounded-[2rem] -> rounded-2xl
          <div key={idx} className="bg-brand-blue p-4 rounded-2xl border border-white/5 shadow-xl group hover:shadow-2xl transition-all duration-300">
            {/* Penyesuaian: w-12 h-12 -> w-9 h-9, text-brand-orange -> text-[#1800ad] */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/10 dark:bg-slate-900/10 text-[#1800ad] shadow-sm border border-white/10 group-hover:bg-[#1800ad] group-hover:text-white transition-all">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
            {/* Penyesuaian: text-3xl -> text-xl */}
            <p className="text-xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        {/* Penyesuaian: p-8 -> p-5, rounded-[2.5rem] -> rounded-2xl */}
        <div className="lg:col-span-2 bg-brand-blue p-5 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-xs font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1800ad]" /> Volume Chat Harian
          </h3>
          {/* Penyesuaian: h-[350px] -> h-[250px] */}
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
        {/* Penyesuaian: p-8 -> p-5, rounded-[2.5rem] -> rounded-2xl */}
        <div className="bg-brand-blue p-5 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-xs font-black text-white mb-6 uppercase tracking-tight">Sumber Chat</h3>
          {/* Penyesuaian: h-[250px] -> h-[180px] */}
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
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', color: '#fff', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-black text-white">100%</p>
            </div>
          </div>
          {/* Penyesuaian: mt-8 -> mt-4, space-y-4 -> space-y-2 */}
          <div className="space-y-2 mt-4">
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 dark:bg-slate-900/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-[#1800ad]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from "../lib/utils";