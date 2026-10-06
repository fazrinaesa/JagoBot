import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "../lib/utils";
import { getDashboardStats, getActiveBot } from "../lib/api";
import { Badge, Button, Card, SegmentedControl, StatCard } from "../components/ui";

const data = [
  { name: "Sen", chats: 400, orders: 240 },
  { name: "Sel", chats: 300, orders: 139 },
  { name: "Rab", chats: 200, orders: 980 },
  { name: "Kam", chats: 278, orders: 390 },
  { name: "Jum", chats: 189, orders: 480 },
  { name: "Sab", chats: 239, orders: 380 },
  { name: "Min", chats: 349, orders: 430 },
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

      const storedBotId = localStorage.getItem('activeBotId');

      let resolvedBotId: number | null = null;

      if (storedBotId) {
        resolvedBotId = Number(storedBotId);
      } else {
        console.warn("⚠️ [DashboardHome] activeBotId tidak ada di localStorage, fallback ke getActiveBot()");
        const botResponse = await getActiveBot();
        const activeBot = botResponse.data;
        if (activeBot && activeBot.id) {
          resolvedBotId = activeBot.id;
          localStorage.setItem('activeBotId', String(resolvedBotId));
        }
      }

      if (resolvedBotId) {
        const response = await getDashboardStats(resolvedBotId, currentPeriod);
        setDashboardData({ ...response.data, activeBotId: resolvedBotId });
      } else {
        console.error("❌ [DashboardHome] Tidak dapat menentukan botId. Data tidak dapat dimuat.");
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Memuat Data JagoBot...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const namaBotAktif = dashboardData?.nama_toko || "Toko Anda";
  const dynamicChartData = stats?.chartData?.length > 0 ? stats.chartData : data;

  const topFaq = stats?.topFaq || [
    { q: "Berapa harga produk ini?", count: 452, trend: "+5%" },
    { q: "Apakah ada promo hari ini?", count: 321, trend: "+12%" },
    { q: "Bisa kirim ke luar kota?", count: 289, trend: "-2%" },
    { q: "Jam berapa toko buka?", count: 156, trend: "+1%" },
    { q: "Metode pembayaran apa saja?", count: 98, trend: "+8%" },
  ];

  // Hitung jumlah chat terbesar untuk skala bar mini
  const maxFaqCount = Math.max(...topFaq.map((f: any) => Number(f.count) || 0), 1);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header section KPI ─────────────────────────────── */}
      <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-blue dark:text-accent-blue-light">
            Ringkasan Statistik
          </p>
          <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Performa {namaBotAktif}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Ikhtisar aktivitas chatbot Anda secara real-time.
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-accent-blue dark:text-accent-blue-light">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-semibold">Memperbarui data...</span>
          </div>
        )}
      </div>

      {/* ── KPI cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Chat"
          value={stats?.totalChat?.toLocaleString() || "0"}
          delta={stats?.chatTrend || "0%"}
          isPositive={stats?.isChatPositive}
          icon={MessageSquare}
          accentColor="blue"
        />
        <StatCard
          title="Pelanggan Baru"
          value={stats?.pelangganBaru?.toLocaleString() || "0"}
          delta="+8.2%"
          isPositive={true}
          icon={Users}
          accentColor="violet"
        />
        <StatCard
          title="Tingkat Konversi"
          value={stats?.tingkatKonversi || "0%"}
          delta="-2.4%"
          isPositive={false}
          icon={TrendingUp}
          accentColor="orange"
        />
        <StatCard
          title="Waktu Respon"
          value={stats?.avgResponse || "0.0s"}
          delta="-15%"
          isPositive={true}
          icon={Clock}
          accentColor="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Grafik Aktivitas Chat ────────────────────────── */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                Aktivitas Chat
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Statistik performa bot {period === 'bulan' ? 'bulan ini' : 'minggu ini'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Legend mini */}
              <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 sm:flex">
                <span className="h-2 w-2 rounded-full bg-accent-blue" /> Chat
              </span>
              <SegmentedControl
                options={[
                  { value: "bulan", label: "Bulan" },
                  { value: "minggu", label: "Minggu" },
                ]}
                value={period}
                onChange={setPeriod}
              />
            </div>
          </div>

          <div className="relative h-[290px] w-full">
            {isChartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Menghitung Data...</span>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e8eaf2" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  width={38}
                  tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: "#c7d2fe", strokeWidth: 1.5 }} />
                <Area
                  type="monotone"
                  dataKey="chats"
                  name="Chat"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorChats)"
                  dot={false}
                  activeDot={{ r: 4.5, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footer ringkasan chart */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4 dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <Zap className="h-3.5 w-3.5 text-accent-green" /> Update otomatis tiap 30 detik
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <ArrowUpRight className="h-3.5 w-3.5 text-accent-blue" />
              Puncak:{" "}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
                {dynamicChartData.reduce((a: any, b: any) => ((b.chats || 0) > (a.chats || 0) ? b : a), dynamicChartData[0])?.name || "-"}
              </strong>
            </span>
          </div>
        </Card>

        {/* ── Top FAQ ──────────────────────────────────────── */}
        <Card className="flex flex-col p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">Top FAQ</h3>
            <Badge variant="info" dot>{topFaq.length} pertanyaan</Badge>
          </div>

          <div className="flex-1 space-y-1">
            {topFaq.map((faq: any, idx: number) => {
              const isDown = faq.trend?.startsWith("-");
              return (
                <div
                  key={idx}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  {/* Ranking chip */}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors",
                      idx === 0
                        ? "bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-soft"
                        : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-400"
                    )}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-200">{faq.q}</p>
                    {/* Progress bar mini sebagai skala volume */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isDown ? "bg-accent-rose/70" : "bg-gradient-to-r from-accent-blue to-accent-violet"
                        )}
                        style={{ width: `${Math.max((Number(faq.count) / maxFaqCount) * 100, 8)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-display text-xs font-bold text-neutral-900 tabular-nums dark:text-white">
                      {faq.count}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        isDown
                          ? "bg-accent-pink/10 text-accent-pink-dark dark:bg-accent-pink/15 dark:text-accent-pink-light"
                          : "bg-accent-green/10 text-accent-green-dark dark:bg-accent-green/15 dark:text-accent-green-light"
                      )}
                    >
                      {isDown ? (
                        <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={2.5} />
                      ) : (
                        <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.5} />
                      )}
                      {faq.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/dashboard/analytics"
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-white py-2.5 text-xs font-semibold text-neutral-700 shadow-soft transition-all hover:border-accent-blue/40 hover:text-accent-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:text-accent-blue-light"
          >
            Lihat analitik lengkap <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>

      {/* ── CTA banner ─────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-brand-blue to-brand-navy text-white">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-blue/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-accent-violet/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <Badge variant="success" dot pulseDot className="border-white/20 bg-white/10 text-emerald-300">
              Status: Aktif
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
              Bot {namaBotAktif} Sedang Bekerja!
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-blue-100/90">
              JagoBot telah menangani {stats?.totalChat || 0} chat. Semua pelanggan terlayani dengan baik.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button
              variant="ghost"
              className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/20 dark:bg-white/10 sm:w-auto"
            >
              Lihat Log Chat
            </Button>
            <Button className="w-full bg-white text-brand-navy shadow-lift hover:bg-blue-50 hover:shadow-lg dark:bg-white dark:text-brand-navy sm:w-auto">
              <Zap className="h-4 w-4" />
              Tes Bot Sekarang
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
