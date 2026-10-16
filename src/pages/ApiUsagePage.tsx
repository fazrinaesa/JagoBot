import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Coins,
  Users,
  Gauge,
  RefreshCw,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import {
  UsageSummaryRow,
  adminGetUsageSummary,
  adminGetUsageTimeline,
  adminGetUsageByModel,
  adminGetUsageLogs,
} from "../lib/api";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, Select, StatCard } from "../components/ui";

/**
 * Halaman Monitoring API (Fase 4) — hanya SUPER_ADMIN.
 * Menampilkan: total token per pengguna, sisa kuota, tren harian,
 * distribusi per model, dan log terbaru.
 */

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n ?? 0);

/** 1.234.567 → "1,23 jt" agar ringkas di kartu */
const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} rb`;
  return String(n ?? 0);
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

export const ApiUsagePage: React.FC = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<{ totals: any; data: UsageSummaryRow[] } | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [byModel, setByModel] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, m, l] = await Promise.all([
        adminGetUsageSummary(days),
        adminGetUsageTimeline(days),
        adminGetUsageByModel(days),
        adminGetUsageLogs(20),
      ]);
      setSummary(s.data);
      setTimeline(t.data.data || []);
      setByModel(m.data.data || []);
      setLogs(l.data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data pemakaian API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  // Pengguna yang kuotanya hampir/ sudah habis (>= 80%)
  const nearLimit = useMemo(
    () => (summary?.data || []).filter(d => d.hasSubscription && d.quotaPercentUsed >= 80),
    [summary]
  );

  if (loading) return <LoadingState label="Memuat data pemakaian API..." />;

  const totals = summary?.totals || { totalTokens: 0, requestCount: 0, activeUsers: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring API"
        description="Pantau pemakaian token, sisa kuota, dan model yang dipakai."
        actions={
          <div className="flex items-center gap-2">
            <Select value={String(days)} onChange={(e) => setDays(Number(e.target.value))}>
              <option value="7">7 hari</option>
              <option value="30">30 hari</option>
              <option value="90">90 hari</option>
              <option value="365">1 tahun</option>
            </Select>
            <Button variant="secondary" onClick={load}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Muat ulang
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL TOKEN" value={fmtCompact(totals.totalTokens)} icon={Coins} accentColor="violet" />
        <StatCard title="TOTAL REQUEST" value={fmtCompact(totals.requestCount)} icon={Activity} accentColor="blue" />
        <StatCard title="PENGGUNA AKTIF" value={String(totals.activeUsers)} icon={Users} accentColor="green" />
        <StatCard
          title="KUOTA KRITIS"
          value={String(nearLimit.length)}
          icon={Gauge}
          accentColor={nearLimit.length > 0 ? "rose" : "teal"}
        />
      </div>

      {/* Peringatan kuota hampir habis */}
      {nearLimit.length > 0 && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">
                {nearLimit.length} pengguna hampir menghabiskan kuota harian
              </p>
              <ul className="mt-1 space-y-0.5 text-neutral-600 dark:text-neutral-300">
                {nearLimit.slice(0, 5).map(u => (
                  <li key={u.userId}>
                    {u.email} — {u.quotaPercentUsed}% ({fmt(u.tokensUsedToday)}/{fmt(u.dailyTokenQuota)} token)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Grafik tren + distribusi model */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Tren Pemakaian Token
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Total token per hari dalam {days} hari terakhir
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => v.slice(5)}
                  fontSize={11}
                  stroke="currentColor"
                  className="text-neutral-400"
                />
                <YAxis fontSize={11} stroke="currentColor" className="text-neutral-400" />
                <Tooltip
                  formatter={(v: any) => [fmt(Number(v)), "Token"]}
                  labelFormatter={(l: any) => `Tanggal ${l}`}
                />
                <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={2} fill="url(#usageFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Pemakaian per Model
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Model mana yang paling dipakai</p>
          {byModel.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-neutral-400">
              <Cpu className="h-8 w-8" />
              Belum ada data model
            </div>
          ) : (
            <>
              <div className="mt-4 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byModel} dataKey="totalTokens" nameKey="model" innerRadius={38} outerRadius={62} paddingAngle={2}>
                      {byModel.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [fmt(Number(v)), "Token"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs">
                {byModel.slice(0, 5).map((m, i) => (
                  <li key={m.model} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="truncate font-mono text-neutral-600 dark:text-neutral-300">{m.model}</span>
                    </span>
                    <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{fmt(m.totalTokens)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* Tabel per pengguna */}
      <Card className="overflow-hidden">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700/60">
          <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Pemakaian per Pengguna
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Total token dan sisa kuota setiap pengguna
          </p>
        </div>

        {!summary?.data?.length ? (
          <EmptyState
            icon={Activity}
            title="Belum ada pemakaian tercatat"
            description="Pemakaian akan muncul setelah chatbot melayani percakapan."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Pengguna</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 text-right font-semibold">Request</th>
                  <th className="px-5 py-3 text-right font-semibold">Total Token</th>
                  <th className="px-5 py-3 font-semibold">Sisa Kuota Harian</th>
                  <th className="px-5 py-3 font-semibold">Paket</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.map(u => (
                  <tr key={u.userId} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">{u.nama_toko}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={u.role === "SUPER_ADMIN" ? "primary" : u.role === "ADMIN" ? "warning" : "neutral"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{fmt(u.requestCount)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{fmt(u.totalTokens)}</td>
                    <td className="px-5 py-3">
                      {u.hasSubscription ? (
                        <div className="min-w-[140px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {fmt(u.remainingToday)} sisa
                            </span>
                            <span className={u.quotaPercentUsed >= 80 ? "font-semibold text-rose-600" : "text-neutral-400"}>
                              {u.quotaPercentUsed}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                u.quotaPercentUsed >= 80 ? "bg-rose-500" : u.quotaPercentUsed >= 50 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, u.quotaPercentUsed)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Tidak ada langganan</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {u.hasSubscription ? (
                        <Badge variant="success">{u.planType}</Badge>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Log terbaru */}
      <Card className="overflow-hidden">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700/60">
          <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Log Pemakaian Terbaru
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">20 permintaan terakhir</p>
        </div>
        {logs.length === 0 ? (
          <EmptyState icon={Activity} title="Belum ada log" description="Log akan muncul setelah ada permintaan chat." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                  <th className="px-5 py-3 font-semibold">Pengguna</th>
                  <th className="px-5 py-3 font-semibold">Endpoint</th>
                  <th className="px-5 py-3 text-right font-semibold">Token</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                    <td className="px-5 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(l.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-2.5 text-neutral-700 dark:text-neutral-200">
                      {l.user?.email || "-"}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-neutral-600 dark:text-neutral-300">{l.endpoint}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{fmt(l.totalTokens)}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Badge variant={l.statusCode === 200 ? "success" : "danger"}>{l.statusCode ?? "—"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
