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
  { name: "Website", value: 25, color: "#0A2647" },
  { name: "Lainnya", value: 10, color: "#FF6B35" },
];

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-brand-blue dark:text-white uppercase tracking-tighter">Analitik Performa</h2>
          <p className="text-slate-400 text-sm font-medium">Pantau bagaimana JagoBot membantu bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-brand-blue hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
            <Calendar className="w-4 h-4 text-brand-orange" /> 1 Mar - 7 Mar 2026
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-brand-orange text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/30">
            <Download className="w-4 h-4" /> Ekspor Laporan
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Percakapan", value: "1,480", icon: MessageCircle },
          { label: "Tingkat Penyelesaian", value: "94%", icon: CheckCircle },
          { label: "Waktu Respon", value: "0.8s", icon: Clock },
          { label: "Kepuasan Pelanggan", value: "4.8/5", icon: TrendingUp },
        ].map((stat, idx) => (
          <div key={idx} className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl group hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/10 text-brand-orange shadow-sm border border-white/10 group-hover:bg-brand-orange group-hover:text-white transition-all">
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-brand-blue p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <h3 className="font-black text-white mb-8 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-orange" /> Volume Chat Harian
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', padding: '15px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="chats" fill="#FF6B35" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-brand-blue p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <h3 className="font-black text-white mb-8 uppercase tracking-tight">Sumber Chat</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A2647', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', padding: '15px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-white">100%</p>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-sm font-black text-brand-orange">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from "../lib/utils";
