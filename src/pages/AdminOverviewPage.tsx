import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  Database,
  MessageCircleQuestion,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import api, {
  adminGetAnalyticsOverview,
  adminGetOverview,
  adminGetPaymentProofs,
  adminGetSubscriptions,
  adminGetUsageTimeline,
} from "../lib/api";
import { Badge, Button, Card, PageHeader, StatCard } from "../components/ui";

interface Overview {
  totalUsers: number;
  totalBots: number;
  totalKnowledgeBases: number;
  totalChats: number;
  roleBreakdown?: { role: string; count: number }[];
}

interface TimelinePoint {
  date: string;
  tokens: number;
  requests: number;
}

interface Totals {
  totalChats: number;
  activeBots: number;
  activeUsers: number;
  avgResponseSec: number;
}

const fmt = (value: number) => new Intl.NumberFormat("id-ID").format(value ?? 0);
const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { weekday: "short" });

const quickLinks = [
  { to: "/dashboard/admin/payment", label: "Tinjau pembayaran", desc: "Verifikasi bukti transfer", icon: Wallet, accent: "blue" as const },
  { to: "/dashboard/admin/users", label: "Kelola pengguna", desc: "Peran dan status akun", icon: Users, accent: "violet" as const },
  { to: "/dashboard/admin/api-usage", label: "Monitoring API", desc: "Token dan permintaan", icon: Activity, accent: "green" as const },
  { to: "/dashboard/admin/questions", label: "Analitik pertanyaan", desc: "Pertanyaan lintas toko", icon: MessageCircleQuestion, accent: "orange" as const },
  { to: "/dashboard/chat-logs", label: "Log chat platform", desc: "Aktivitas percakapan", icon: MessageSquare, accent: "teal" as const },
  { to: "/dashboard/admin/ai-config", label: "Konfigurasi AI", desc: "Provider dan failover", icon: Database, accent: "pink" as const },
];

export const AdminOverviewPage = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const [overview, analytics, usage, payments, subscriptions] = await Promise.all([
        adminGetOverview(),
        adminGetAnalyticsOverview(7),
        adminGetUsageTimeline(7),
        adminGetPaymentProofs("pending"),
        adminGetSubscriptions(),
      ]);
      setData(overview.data);
      setTotals(analytics.data?.totals ?? null);
      setTimeline(usage.data?.data ?? []);
      setPendingPayments((payments.data?.data || []).length);
      setActiveSubscriptions((subscriptions.data?.data || []).filter((item: any) => item.status === "active").length);
      setError("");
      setLastUpdated(new Date());
    } catch {
      setError("Gagal memuat ringkasan platform.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const cards = [
    { label: "Pengguna", value: data?.totalUsers, icon: Users, accent: "blue" as const },
    { label: "Toko / Bot", value: data?.totalBots, icon: Store, accent: "violet" as const },
    { label: "Percakapan", value: data?.totalChats, icon: MessageSquare, accent: "green" as const },
    { label: "Pembayaran menunggu", value: pendingPayments, icon: CreditCard, accent: "orange" as const },
  ];

  const roleRows = (data?.roleBreakdown || []).map((row) => ({
    label: row.role === "SUPER_ADMIN" ? "Super Admin" : "Pengguna",
    count: row.count,
  }));
  const totalRoles = roleRows.reduce((sum, row) => sum + row.count, 0) || 1;
  const maxRequests = Math.max(1, ...timeline.map((point) => point.requests));

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <PageHeader
        title="Ringkasan Platform"
        description="Operasional global JagoBot."
        actions={
          <Button variant="secondary" onClick={() => void load(true)} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Muat ulang
          </Button>
        }
      />

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
        Diperbarui otomatis tiap 5 detik{lastUpdated ? ` · terakhir ${lastUpdated.toLocaleTimeString("id-ID")}` : ""}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon, accent }) => (
          <StatCard key={label} title={label.toUpperCase()} value={value == null ? "—" : fmt(value)} icon={icon} accentColor={accent} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-5 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent-blue/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">Aktivitas 7 Hari</h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Permintaan API harian dari seluruh toko.</p>
            </div>
            <Badge variant="info" dot>Aktif</Badge>
          </div>
          <div className="relative mt-6 flex h-40 items-end gap-2">
            {timeline.length === 0 ? (
              <p className="w-full text-center text-xs text-neutral-400">Belum ada data penggunaan API.</p>
            ) : timeline.map((point) => (
              <div key={point.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-semibold tabular-nums text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100">{point.requests}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-accent-blue to-accent-violet/70 transition-all duration-300 group-hover:from-accent-blue-dark group-hover:to-accent-violet"
                  style={{ height: `${Math.max(4, (point.requests / maxRequests) * 100)}%` }}
                  title={`${point.requests} permintaan · ${fmt(point.tokens)} token`}
                />
                <span className="text-[10px] font-medium text-neutral-400">{dayLabel(point.date)}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-5 flex flex-wrap gap-5 border-t border-border-subtle pt-4 text-xs dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-neutral-500"><TrendingUp className="h-3.5 w-3.5 text-accent-blue" /> Rata-rata respons <strong className="text-neutral-800 dark:text-neutral-100">{totals?.avgResponseSec ?? 0}s</strong></span>
            <span className="flex items-center gap-1.5 text-neutral-500"><Activity className="h-3.5 w-3.5 text-accent-green" /> Bot aktif <strong className="text-neutral-800 dark:text-neutral-100">{fmt(totals?.activeBots ?? 0)}</strong></span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">Komposisi Pengguna</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Distribusi peran akun terdaftar.</p>
          <div className="mt-5 space-y-4">
            {roleRows.length === 0 ? <p className="text-xs text-neutral-400">Belum ada data peran.</p> : roleRows.map((row, index) => {
              const percent = Math.round((row.count / totalRoles) * 100);
              return (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">{row.label}</span>
                    <span className="tabular-nums text-neutral-400">{fmt(row.count)} · {percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className={`h-full rounded-full ${index === 0 ? "bg-gradient-to-r from-accent-blue to-accent-violet" : "bg-accent-teal"}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-accent-green/5 p-3 text-xs text-neutral-600 dark:text-neutral-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent-green" />
            {activeSubscriptions} langganan aktif dari seluruh pengguna.
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">Akses Cepat</h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Tugas operasional yang paling sering dipakai.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map(({ to, label, desc, icon: Icon, accent }) => (
            <Link key={to} to={to} className="group">
              <Card hover accentColor={accent} className="flex h-full items-center gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 ring-1 ring-inset ring-neutral-200 transition-colors group-hover:bg-white dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-white">{label}</span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{desc}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-accent-blue" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
