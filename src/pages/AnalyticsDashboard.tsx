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
  Cell,
} from "recharts";
import { Download, TrendingUp, MessageCircle, Clock, CheckCircle, Star, BarChart3, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { getAnalyticsStats, getActiveBot } from "../lib/api";
import { Badge, Button, Card, PageHeader, Select, StatCard } from "../components/ui";

const chartTooltipStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  border: "1px solid #e8eaf2",
  boxShadow: "0 12px 32px -8px rgba(16,24,40,0.15)",
  padding: "10px 12px",
  fontSize: "12px",
  color: "#0f172a",
};

const PIE_COLORS = ["#4f46e5", "#7c3aed", "#14b8a6", "#f59e0b", "#f43f5e"];

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("bulan");

  const fetchData = async () => {
    try {
      const storedBotId = localStorage.getItem("activeBotId");
      let resolvedBotId: number | null = null;

      if (storedBotId) {
        resolvedBotId = Number(storedBotId);
      } else {
        const botResponse = await getActiveBot();
        const activeBot = botResponse.data;
        if (activeBot && activeBot.id) {
          resolvedBotId = activeBot.id;
          localStorage.setItem("activeBotId", String(resolvedBotId));
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
    }, 30000);
    return () => clearInterval(interval);
  }, [period]);

  if (loading && !analyticsData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Memuat Data Analitik...
          </p>
        </div>
      </div>
    );
  }

  const chatData = analyticsData?.chatData || [];
  const sourceData = analyticsData?.sourceData || [];

  const totalChats = analyticsData?.totalChats || 0;
  const completionRate = analyticsData?.completionRate || "0%";
  const responseTime = analyticsData?.responseTime || "0.0s";

  // Statistik turunan untuk footer chart
  const maxEntry = chatData.reduce(
    (a: any, b: any) => ((b.chats || 0) > (a?.chats || 0) ? b : a),
    chatData[0]
  );
  const hasData = chatData.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <PageHeader
        title="Analitik Performa"
        description="Pantau bagaimana JagoBot membantu bisnis Anda."
        actions={
          <>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-auto min-w-[130px] text-xs"
            >
              <option value="bulan">Bulan Ini</option>
              <option value="minggu">Minggu Ini</option>
            </Select>
            <Button>
              <Download className="h-4 w-4" /> Ekspor
            </Button>
          </>
        }
      />

      {/* ── Widget statistik (KPI) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Percakapan" value={totalChats.toLocaleString()} icon={MessageCircle} accentColor="blue" />
        <StatCard title="Tingkat Penyelesaian" value={completionRate} icon={CheckCircle} accentColor="green" />
        <StatCard title="Waktu Respon" value={responseTime} icon={Clock} accentColor="violet" />
        <StatCard title="Kepuasan Pelanggan" value="N/A" icon={Star} accentColor="orange" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Volume Chat Harian ── */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue ring-1 ring-inset ring-accent-blue/20 dark:bg-accent-blue/15 dark:text-accent-blue-light dark:ring-accent-blue/30">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                  Volume Chat Harian
                </h3>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Jumlah percakapan per hari · {period === "bulan" ? "bulan ini" : "minggu ini"}
                </p>
              </div>
            </div>
            <Badge variant="info">Live · 30s</Badge>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e8eaf2" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  width={38}
                  tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  cursor={{ fill: "#eef0f7", radius: 8 }}
                />
                <Bar dataKey="chats" name="Chat" fill="url(#barGradient)" radius={[7, 7, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Footer ringkasan */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4 dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              Hari tertinggi:{" "}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
                {hasData ? `${maxEntry?.name} (${maxEntry?.chats ?? 0})` : "-"}
              </strong>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              Total periode:{" "}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
                {totalChats.toLocaleString()} chat
              </strong>
            </span>
          </div>
        </Card>

        {/* ── Sumber Chat ── */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Sumber Chat
            </h3>
            <Badge variant="neutral">{sourceData.length} kanal</Badge>
          </div>

          <div className="relative mx-auto h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData.length > 0 ? sourceData : [{ name: "Belum ada data", value: 100, color: "#e8eaf2" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={5}
                >
                  {(sourceData.length > 0 ? sourceData : [{ color: "#e8eaf2" }]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Total</p>
              <p className="font-display text-lg font-bold text-neutral-900 dark:text-white">100%</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {sourceData.map((item: any, idx: number) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-neutral-50/60 px-3 py-2.5 transition-all hover:bg-white hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900"
                    style={{ backgroundColor: item.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">{item.name}</span>
                </div>
                <span className="flex items-center gap-1 font-display text-xs font-bold tabular-nums text-neutral-900 dark:text-white">
                  {item.value}%
                  {idx === 0 && sourceData.length > 1 ? (
                    <ChevronUp className="h-3 w-3 text-accent-green" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-neutral-300 dark:text-neutral-600" />
                  )}
                </span>
              </div>
            ))}
            {sourceData.length === 0 && (
              <div className="py-3 text-center text-xs font-medium text-neutral-400">
                Belum ada data sumber
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
