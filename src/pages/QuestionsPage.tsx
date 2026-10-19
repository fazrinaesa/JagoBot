import React, { useEffect, useState } from "react";
import {
  MessageCircleQuestion,
  Search,
  TrendingUp,
  Store,
  Bot,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  TopQuestion,
  UnansweredQuestion,
  adminGetAnalyticsOverview,
  adminGetTopQuestions,
  adminGetUnanswered,
} from "../lib/api";
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Select, StatCard } from "../components/ui";

/**
 * Halaman Analitik Pertanyaan Global (Fase 5) — hanya SUPER_ADMIN.
 * Melihat pertanyaan yang paling sering ditanyakan pelanggan
 * di SELURUH toko (lintas semua pengguna).
 */

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n ?? 0);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export const QuestionsPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [top, setTop] = useState<TopQuestion[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"top" | "unanswered">("top");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, t, u] = await Promise.all([
        adminGetAnalyticsOverview(days),
        adminGetTopQuestions(days, 30),
        adminGetUnanswered(days, 30),
      ]);
      setOverview(o.data.totals);
      setTop(t.data.data || []);
      setUnanswered(u.data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat analitik pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  if (loading) return <LoadingState label="Memuat analitik pertanyaan..." />;

  const list = tab === "top" ? top : unanswered;
  const filtered = search.trim()
    ? list.filter((q: any) => q.question.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik Pertanyaan"
        description="Pertanyaan yang paling sering ditanyakan pelanggan di seluruh toko."
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
        <StatCard title="TOTAL PERTANYAAN" value={fmt(overview?.totalChats ?? 0)} icon={MessageCircleQuestion} accentColor="blue" />
        <StatCard title="TOKO AKTIF" value={fmt(overview?.activeUsers ?? 0)} icon={Store} accentColor="green" />
        <StatCard title="BOT AKTIF" value={fmt(overview?.activeBots ?? 0)} icon={Bot} accentColor="violet" />
        <StatCard title="RATA-RATA RESPON" value={`${overview?.avgResponseSec ?? 0}s`} icon={Clock} accentColor="orange" />
      </div>

      {/* Peringatan KB kurang */}
      {unanswered.length > 0 && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">
                {unanswered.length} pertanyaan belum terjawab dengan baik
              </p>
              <p className="mt-1 text-neutral-600 dark:text-neutral-300">
                Pertanyaan ini muncul karena Knowledge Base bot belum memuat informasinya.
                Tambahkan materinya agar bot bisa menjawab lebih akurat.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab + pencarian */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("top")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "top"
                  ? "bg-accent-blue/10 text-accent-blue-dark dark:text-accent-blue-light"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Paling Sering ({top.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("unanswered")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "unanswered"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <HelpCircle className="h-4 w-4" /> Belum Terjawab ({unanswered.length})
            </button>
          </div>

          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MessageCircleQuestion}
            title={search ? "Tidak ada pertanyaan yang cocok" : "Belum ada data pertanyaan"}
            description={
              search
                ? "Coba kata kunci lain."
                : "Data akan muncul setelah chatbot melayani percakapan pelanggan."
            }
          />
        ) : (
          <ol className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filtered.map((q: any, i) => (
              <li key={`${q.question}-${i}`} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{q.question}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <MessageCircleQuestion className="h-3 w-3" /> {fmt(q.count)}× ditanya
                    </span>
                    {q.storeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Store className="h-3 w-3" /> {q.storeCount} toko
                      </span>
                    )}
                    {q.botCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3" /> {q.botCount} bot
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> terakhir {fmtDate(q.lastAsked)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {tab === "unanswered" ? (
                    <Badge variant={q.reason === "jawaban_kosong" ? "danger" : "warning"}>
                      {q.reason === "jawaban_kosong" ? "Jawaban kosong" : "Tidak ditemukan"}
                    </Badge>
                  ) : (
                    <Badge variant={i === 0 ? "primary" : i < 3 ? "info" : "neutral"}>
                      {i === 0 ? "Terpopuler" : `#${i + 1}`}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
};
