import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronRight,
  MessageCircle,
  Globe,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "../lib/utils";
import { getDashboardStats, getAnalyticsStats, getActiveBot } from "../lib/api";
import { Badge, Button, Card, Select, SegmentedControl, StatCard } from "../components/ui";

/* ─────────────────────────────────────────────────────────────
 * Konstanta & data fallback
 * ───────────────────────────────────────────────────────────── */
const PERIOD_OPTIONS = [
  { value: "bulan", label: "Bulan Ini" },
  { value: "minggu", label: "Minggu Ini" },
];

const GRANULARITY_OPTIONS = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
];


const chartTooltipStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  border: "1px solid #e8eaf2",
  boxShadow: "0 12px 32px -8px rgba(16,24,40,0.15)",
  padding: "10px 12px",
  fontSize: "12px",
  color: "#0f172a",
};

/* ─────────────────────────────────────────────────────────────
 * Util agregasi grafik di sisi frontend
 * ───────────────────────────────────────────────────────────── */
type ChartPoint = { name: string; chats: number };

const aggregateChart = (data: ChartPoint[], granularity: string): ChartPoint[] => {
  if (granularity === "harian") return data;

  if (granularity === "mingguan") {
    const weeks: ChartPoint[] = [];
    for (let i = 0; i < data.length; i += 7) {
      const chunk = data.slice(i, i + 7);
      weeks.push({
        name: `Minggu ${weeks.length + 1}`,
        chats: chunk.reduce((sum, d) => sum + (Number(d.chats) || 0), 0),
      });
    }
    return weeks.length > 0 ? weeks : data;
  }

  // bulanan
  const total = data.reduce((sum, d) => sum + (Number(d.chats) || 0), 0);
  return total > 0 ? [{ name: "Bulan ini", chats: total }] : data;
};

/* ─────────────────────────────────────────────────────────────
 * Halaman Dashboard utama — gabungan Ringkasan + Analitik
 * ───────────────────────────────────────────────────────────── */
export const DashboardWithAnalytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("bulan");
  const [granularity, setGranularity] = useState("harian");

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const resolveBotId = async (): Promise<number | null> => {
    const storedBotId = localStorage.getItem("activeBotId");
    if (storedBotId) return Number(storedBotId);

    try {
      const botResponse = await getActiveBot();
      const activeBot = botResponse.data;
      if (activeBot?.id) {
        localStorage.setItem("activeBotId", String(activeBot.id));
        return activeBot.id as number;
      }
    } catch (err) {
      console.error("Gagal mendapatkan bot aktif:", err);
    }
    return null;
  };

  const fetchAll = async (nextPeriod: string, silent = false) => {
    try {
      if (silent) setIsRefreshing(true);
      if (dashboardData && period !== nextPeriod) setIsChartLoading(true);

      const botId = await resolveBotId();
      if (!botId) return;

      const [dashboardRes, analyticsRes] = await Promise.all([
        getDashboardStats(botId, nextPeriod),
        getAnalyticsStats(botId, nextPeriod),
      ]);
      setDashboardData(dashboardRes.data);
      setAnalyticsData(analyticsRes.data.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(period);
    // Auto-refresh data setiap 30 detik (tanpa menampilkan loading)
    const interval = setInterval(() => fetchAll(period, true), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  /* ── Derived data ─────────────────────────────────────────── */
  const stats = dashboardData?.stats;
  const analytics = analyticsData;

  const namaBotAktif = dashboardData?.nama_toko || "Toko Anda";

  const rawChartData: ChartPoint[] = stats?.chartData ?? [];
  const chartData = useMemo(
    () => aggregateChart(rawChartData, granularity),
    [rawChartData, granularity]
  );

  const topFaq = stats?.topFaq ?? [];
  const totalFaq = topFaq.reduce((sum: number, f: any) => sum + (Number(f.count) || 0), 0);
  const maxFaqCount = Math.max(...topFaq.map((f: any) => Number(f.count) || 0), 1);

  const sourceData = analytics?.sourceData ?? [];

  /* ── Ekspor CSV ───────────────────────────────────────────── */
  const handleExport = () => {
    const rows = [
      `Ringkasan Periode,${period}`,
      `Total Percakapan,${stats?.totalChat ?? 0}`,
      `Pelanggan Baru,${stats?.pelangganBaru ?? 0}`,
      `Tingkat Konversi,${stats?.tingkatKonversi ?? "0%"}`,
      `Waktu Respon,${stats?.avgResponse ?? "0.0s"}`,
      "",
      "no,pertanyaan,total,tren",
      ...topFaq.map((f: any, i: number) => `${i + 1},"${f.q}",${f.count},${f.trend ?? "-"}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jagobot-dashboard.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Memuat Data JagoBot...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* ── 1. Header & Filter Global ─────────────────────────── */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-blue dark:text-accent-blue-light">
            JagoBot
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 w-auto min-w-[130px] cursor-pointer py-0 text-xs font-semibold"
            aria-label="Filter periode"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Button size="md" onClick={handleExport} className="h-9 shrink-0 py-0 px-4">
            <Download className="h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </header>

      {/* ── 2. Ringkasan Statistik (5 KPI) ───────────────────── */}
      <section
        aria-label="Ringkasan statistik"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard
          title="Total Percakapan"
          value={stats?.totalChat?.toLocaleString() ?? "0"}
          delta={stats?.chatTrend ?? "0%"}
          isPositive={stats?.isChatPositive}
          icon={MessageSquare}
          accentColor="blue"
        />
        <StatCard
          title="Pelanggan Baru"
          value={stats?.pelangganBaru == null ? "—" : stats.pelangganBaru.toLocaleString()}
          delta=""
          isPositive={undefined}
          icon={Users}
          accentColor="violet"
        />
        <StatCard
          title="Tingkat Konversi"
          value={stats?.tingkatKonversi ?? "—"}
          delta=""
          isPositive={undefined}
          icon={TrendingUp}
          accentColor="orange"
        />
        <StatCard
          title="Waktu Respon"
          value={stats?.avgResponse ?? "0.0s"}
          delta=""
          // Turun = lebih cepat = positif
          isPositive={true}
          icon={Clock}
          accentColor="green"
        />
        <StatCard
          title="Kepuasan Pelanggan"
          value="N/A"
          delta=""
          isPositive={undefined}
          icon={Users}
          accentColor="teal"
        />
      </section>

      {/* ── 3. Visualisasi Tren Utama (full-width) ───────────── */}
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Volume Chat Harian
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Filter periode berlaku untuk kartu dan grafik; grafik mengelompokkan chat {period === "bulan" ? "bulan ini" : "minggu ini"}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-accent-violet" /> Chat
            </span>
            <SegmentedControl
              options={GRANULARITY_OPTIONS}
              value={granularity}
              onChange={setGranularity}
            />
          </div>
        </div>

        <div className="relative h-[290px] w-full">
          {isChartLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
            </div>
          )}

          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">Belum ada data chat pada periode ini.</div>
          ) : <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.03} />
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
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{ stroke: "#c4b5fd", strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="chats"
                name="Chat"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorChats)"
                dot={false}
                activeDot={{ r: 4.5, fill: "#7c3aed", stroke: "#ffffff", strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4 dark:border-neutral-800">
          <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <Clock className="h-3.5 w-3.5 text-accent-green" /> Update otomatis tiap 5 detik
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <TrendingUp className="h-3.5 w-3.5 text-accent-blue" />
            Total periode:{" "}
            <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
              {rawChartData.reduce((a, b) => a + (Number(b.chats) || 0), 0).toLocaleString()} chat
            </strong>
          </span>
        </div>
      </Card>

      {/* ── 4. Detail Insight & Distribusi (60:40) ───────────── */}
      <section
        aria-label="Detail insight dan distribusi"
        className="grid grid-cols-1 gap-6 lg:grid-cols-5"
      >
        {/* Kolom kiri: Top FAQ */}
        <Card className="flex flex-col p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Top FAQ
            </h2>
            <Badge variant="violet" dot>
              {topFaq.length} pertanyaan
            </Badge>
          </div>

          <ol className="flex-1 space-y-1">
            {topFaq.length === 0 ? (
              <li className="py-8 text-center text-sm text-neutral-400">Belum ada pertanyaan pada periode ini.</li>
            ) : topFaq.map((faq: any, idx: number) => {
              const isDown = faq.trend?.startsWith("-");
              const percent = totalFaq > 0 ? Math.round((Number(faq.count) / totalFaq) * 100) : 0;
              return (
                <li
                  key={idx}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-[11px] font-bold text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                        {faq.q}
                      </p>
                      {faq.trend && <span
                        className={cn(
                          "shrink-0 text-xs font-bold tabular-nums",
                          isDown
                            ? "text-accent-pink-dark dark:text-accent-pink-light"
                            : "text-accent-green-dark dark:text-accent-green-light"
                        )}
                      >
                        {isDown ? (
                          <ArrowDownRight className="mr-0.5 inline h-3 w-3 align-[-1px]" strokeWidth={2.5} />
                        ) : (
                          <ArrowUpRight className="mr-0.5 inline h-3 w-3 align-[-1px]" strokeWidth={2.5} />
                        )}
                        {faq.trend}
                      </span>}
                    </div>
                    {/* Progress bar tipis */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-blue transition-all duration-500"
                        style={{ width: `${Math.max((Number(faq.count) / maxFaqCount) * 100, 8)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-right">
                    <p className="font-display text-xs font-bold text-neutral-900 tabular-nums dark:text-white">
                      {Number(faq.count).toLocaleString()}
                    </p>
                    <span className="text-[11px] font-medium text-neutral-400">{percent}%</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Kolom kanan: Sumber Chat */}
        <Card className="flex flex-col p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Sumber Chat
            </h2>
            <Badge variant="neutral">{sourceData.length} kanal</Badge>
          </div>

          {sourceData.length === 0 ? (
            <div className="flex h-[170px] items-center justify-center text-sm text-neutral-400">Belum ada data kanal.</div>
          ) : (
          <div className="relative mx-auto h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={5}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`src-${index}`} fill={entry.color ?? "#7c3aed"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Total
              </p>
              <p className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                {sourceData.reduce((sum: any, s: any) => sum + (Number(s.value) || 0), 0)}%
              </p>
            </div>
          </div>
          )}

          <div className="mt-5 space-y-2">
            {sourceData.map((item: any, idx: number) => (
              <div
                key={item.name ?? idx}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-neutral-50/60 px-3 py-2.5 transition-all hover:bg-white hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900"
                    style={{ backgroundColor: item.color ?? "#7c3aed" }}
                  />
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    {item.name?.toLowerCase().includes("web") && !item.name?.toLowerCase().includes("whatsapp") ? (
                      <Globe className="h-3.5 w-3.5 text-neutral-400" />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                    {item.name}
                  </span>
                </div>
                <span className="font-display text-xs font-bold tabular-nums text-neutral-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── 5. Banner Status Operasional (CTA) ───────────────── */}
      <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-blue/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-accent-violet/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div>
            <Badge
              variant="success"
              dot
              pulseDot
              className="border-white/20 bg-white/10 text-emerald-300"
            >
              Status: Aktif
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
              Bot Toko Anda Sedang Bekerja!
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-blue-100/90">
              JagoBot telah menangani {(stats?.totalChat ?? 0).toLocaleString()} percakapan dan
              terus melayani pelanggan Anda tanpa henti.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/chat-logs")}
              className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/20 dark:bg-white/10 sm:w-auto"
            >
              Lihat Log Chat
            </Button>
            <Button onClick={() => navigate("/dashboard/playground")} className="w-full bg-white text-neutral-900 shadow-lift hover:bg-blue-50 hover:shadow-lg dark:bg-white dark:text-neutral-900 sm:w-auto">
              <MessageCircle className="h-4 w-4" />
              Tes Bot Sekarang
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
