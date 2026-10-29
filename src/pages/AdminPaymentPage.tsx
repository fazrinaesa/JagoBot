import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, Eye, Wallet, UserCheck } from "lucide-react";
import {
  adminGetPaymentProofs,
  adminReviewPayment,
  adminGetSubscriptions,
} from "../lib/api";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Textarea } from "../components/ui";

const STATUS_BADGE: Record<string, { variant: "warning" | "success" | "danger" | "neutral"; label: string }> = {
  pending: { variant: "warning", label: "Menunggu" },
  approved: { variant: "success", label: "Disetujui" },
  rejected: { variant: "danger", label: "Ditolak" },
};

const proofImageUrl = (proofUrl: string) => {
  const path = proofUrl.startsWith("/uploads/proof_")
    ? proofUrl.replace("/uploads/", "/uploads/proofs/")
    : proofUrl;
  return `${import.meta.env.VITE_API_URL || ""}${path}`;
};

const SUB_STATUS_BADGE: Record<string, { variant: "success" | "warning" | "neutral"; label: string }> = {
  active: { variant: "success", label: "Aktif" },
  expired: { variant: "warning", label: "Kedaluwarsa" },
};

export const AdminPaymentPage: React.FC = () => {
  const [proofs, setProofs] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (showSpinner = false) => {
    try {
      const [proofsRes, subsRes] = await Promise.all([
        adminGetPaymentProofs(filter),
        adminGetSubscriptions(),
      ]);
      setProofs(proofsRes.data?.data || []);
      setSubscriptions(subsRes.data?.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Admin payment fetch error:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void fetchData(true);
  }, [filter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !showDetail && reviewing === null) void fetchData();
    }, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && !showDetail) void fetchData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [filter, showDetail, reviewing]);

  const handleReview = async (proofId: number, action: "approve" | "reject") => {
    if (reviewing !== null) return;
    setReviewing(proofId);
    try {
      await adminReviewPayment(proofId, action, adminNote || undefined);
      alert(action === "approve" ? "Pembayaran disetujui!" : "Pembayaran ditolak.");
      setAdminNote("");
      if (selectedProof?.id === proofId) {
        setSelectedProof((current: any) => current ? { ...current, status: action === "approve" ? "approved" : "rejected" } : current);
      }
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal memproses review.");
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
      </div>
    );
  }

  const tabs: { id: string; label: string }[] = [
    { id: "pending", label: "Menunggu" },
    { id: "approved", label: "Disetujui" },
    { id: "rejected", label: "Ditolak" },
    { id: "", label: "Semua" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Verifikasi Pembayaran"
        description="Tinjau bukti transfer dan kelola langganan pengguna."
      />

      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
        Diperbarui otomatis tiap 5 detik{lastUpdated ? ` · terakhir ${lastUpdated.toLocaleTimeString("id-ID")}` : ""}
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id || "all"}
            onClick={() => setFilter(tab.id)}
            className={cnx(
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all focus-ring",
              filter === tab.id
                ? "bg-accent-blue text-white shadow-soft"
                : "border border-border-subtle bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bukti pembayaran */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border-subtle p-4 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Bukti Pembayaran
          </h3>
        </div>

        {proofs.length === 0 ? (
          <EmptyState icon={Search} title="Tidak ada data" description="Coba ubah filter status di atas." />
        ) : (
          <div className="divide-y divide-border-subtle dark:divide-neutral-800">
            {proofs.map((p: any) => {
              const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet text-xs font-bold uppercase text-white shadow-soft">
                      {p.user?.nama_toko?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                        {p.user?.nama_toko}
                      </p>
                      <p className="truncate text-xs text-neutral-400">{p.user?.email}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      Rp{p.amount.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    {p.subscription && (
                      <p className="text-[11px] font-medium text-neutral-400">Plan: {p.subscription.planType}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {p.proofUrl && (
                      <button
                        onClick={() => {
                          setSelectedProof(p);
                          setShowDetail(true);
                        }}
                        className="rounded-lg border border-border-subtle bg-white p-2 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800 focus-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        title="Lihat bukti"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {p.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleReview(p.id, "approve")}
                          disabled={reviewing === p.id}
                          className="rounded-lg bg-accent-green/10 p-2 text-accent-green transition-colors hover:bg-accent-green/20 focus-ring disabled:opacity-50"
                          title="Setujui"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReview(p.id, "reject")}
                          disabled={reviewing === p.id}
                          className="rounded-lg bg-accent-pink/10 p-2 text-accent-pink transition-colors hover:bg-accent-pink/20 focus-ring disabled:opacity-50"
                          title="Tolak"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Badge variant={badge.variant} dot>{badge.label}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Semua langganan */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border-subtle p-4 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
            <UserCheck className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Semua Langganan
          </h3>
        </div>

        {subscriptions.length === 0 ? (
          <EmptyState icon={UserCheck} title="Tidak ada langganan" />
        ) : (
          <div className="divide-y divide-border-subtle dark:divide-neutral-800">
            {subscriptions.map((s: any) => {
              const badge = SUB_STATUS_BADGE[s.status] || { variant: "neutral" as const, label: s.status };
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet text-xs font-bold uppercase text-white shadow-soft">
                      {s.user?.nama_toko?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{s.user?.nama_toko}</p>
                      <p className="text-xs text-neutral-400">{s.user?.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{s.planType}</p>
                    <p className="text-xs text-neutral-400">
                      Kuota: {s.tokensUsedToday?.toLocaleString() || 0}/{s.dailyTokenQuota?.toLocaleString()}
                    </p>
                  </div>

                  <Badge variant={badge.variant} dot className="shrink-0">{badge.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal detail */}
      {showDetail && selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in bg-neutral-950/50 backdrop-blur-sm"
            onClick={() => {
              setShowDetail(false);
              setSelectedProof(null);
            }}
          />
          <div className="relative w-full max-w-lg space-y-4 rounded-3xl border border-border-subtle bg-white p-6 shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Detail Pembayaran
            </h2>
            <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-neutral-50/60 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-800/40">
              <p className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-300">
                <span className="text-neutral-400">User</span>
                <span className="text-right font-medium">{selectedProof.user?.nama_toko} ({selectedProof.user?.email})</span>
              </p>
              <p className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-300">
                <span className="text-neutral-400">Jumlah</span>
                <span className="font-display font-bold text-neutral-900 dark:text-white">
                  Rp{selectedProof.amount.toLocaleString("id-ID")}
                </span>
              </p>
              <p className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-300">
                <span className="text-neutral-400">Plan</span>
                <span className="font-medium">{selectedProof.subscription?.planType}</span>
              </p>
              <p className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-300">
                <span className="text-neutral-400">Tanggal</span>
                <span className="font-medium">{new Date(selectedProof.createdAt).toLocaleString("id-ID")}</span>
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Bukti Transfer</p>
              {selectedProof.proofUrl ? (
                <img
                  src={proofImageUrl(selectedProof.proofUrl)}
                  alt="Bukti transfer"
                  className="max-h-[60vh] min-h-40 w-full rounded-2xl border border-border-subtle bg-neutral-50 object-contain dark:border-neutral-700 dark:bg-neutral-800"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.hidden = false;
                  }}
                  onLoad={(event) => {
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.hidden = true;
                  }}
                />
              ) : null}
              <p hidden={!selectedProof.proofUrl} className="rounded-xl border border-border-subtle bg-neutral-50 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                Foto tidak dapat dimuat. File bukti mungkin tidak tersedia di server.
              </p>
            </div>

            {selectedProof.status === "pending" && (
              <div className="space-y-3 pt-1">
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Catatan admin (opsional)"
                  className="min-h-[64px]"
                />
                <div className="flex gap-2.5">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => handleReview(selectedProof.id, "approve")}
                    disabled={reviewing !== null || selectedProof.status !== "pending"}
                  >
                    {reviewing === selectedProof.id ? "Memproses..." : "Setujui"}
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleReview(selectedProof.id, "reject")}
                    disabled={reviewing !== null || selectedProof.status !== "pending"}
                  >
                    {reviewing === selectedProof.id ? "Memproses..." : "Tolak"}
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setShowDetail(false);
                setSelectedProof(null);
              }}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function cnx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
