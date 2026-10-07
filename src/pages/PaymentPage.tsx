import React, { useState, useEffect } from "react";
import { CreditCard, Upload, Clock, CheckCircle, AlertCircle, Zap, Sparkles, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import {
  getMySubscription,
  getMyPaymentProofs,
  getTokenQuota,
  submitPaymentProof,
} from "../lib/api";
import { Badge, Button, Card, Input, PageHeader, Modal } from "../components/ui";

const PRICING = [
  {
    id: "basic",
    name: "Paket Dasar",
    price: 349000,
    period: "sekali (setup)",
    tagline: "Mulai digitalisasi layanan toko",
    features: ["Setup awal oleh tim", "Integrasi Spreadsheet", "2 minggu support", "Dashboard analitik dasar"],
    recommended: false,
  },
  {
    id: "whatsapp",
    name: "Add-on WhatsApp",
    price: 139000,
    period: "/bulan",
    tagline: "Paling laris untuk UMKM",
    features: ["Bot WhatsApp aktif", "Kuota 15.000 token/hari", "Auto-reply pelanggan", "Notifikasi chat masuk"],
    recommended: true,
  },
  {
    id: "telegram",
    name: "Add-on Telegram",
    price: 95999,
    period: "/bulan",
    tagline: "Ringan & fleksibel",
    features: ["Bot Telegram aktif", "Kuota 10.000 token/hari", "Support channel & group"],
    recommended: false,
  },
  {
    id: "whatsapp+telegram",
    name: "Combo WA + Telegram",
    price: 234999,
    period: "/bulan",
    tagline: "Cakupan maksimal",
    features: ["Kedua channel aktif", "Kuota 20.000 token/hari", "Prioritas support", "Semua fitur add-on"],
    recommended: false,
  },
];

const STATUS_BADGE: Record<string, { variant: "warning" | "success" | "danger" | "neutral"; label: string }> = {
  pending: { variant: "warning", label: "Menunggu" },
  approved: { variant: "success", label: "Disetujui" },
  rejected: { variant: "danger", label: "Ditolak" },
};

export const PaymentPage: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const [subRes, proofsRes, quotaRes] = await Promise.all([
        getMySubscription(),
        getMyPaymentProofs(),
        getTokenQuota(),
      ]);
      setSubscription(subRes.data?.data);
      setProofs(proofsRes.data?.data || []);
      setQuota(quotaRes.data?.data);
    } catch (err) {
      console.error("Payment page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanSelect = (planId: string) => {
    const plan = PRICING.find((p) => p.id === planId);
    setSelectedPlan(planId);
    setTransferAmount(plan ? String(plan.price) : "");
    setShowModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !transferAmount) {
      alert("Pilih paket dan isi jumlah transfer.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("planType", selectedPlan);
      formData.append("amount", transferAmount);
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      await submitPaymentProof(formData);
      alert("Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.");
      setShowModal(false);
      setProofFile(null);
      setTransferAmount("");
      setSelectedPlan("");
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengirim bukti pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
      </div>
    );
  }

  const isActive = subscription?.status === "active";
  const quotaPercent = quota?.hasSubscription
    ? Math.min((quota.tokensUsedToday / quota.dailyTokenQuota) * 100, 100)
    : 0;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Pembayaran & Langganan"
        description="Kelola paket dan status langganan bot Anda."
      />

      {/* ── Banner status langganan ── */}
      {isActive ? (
        <div className="flex items-center gap-4 rounded-2xl border border-accent-green/20 bg-accent-green/5 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green ring-1 ring-inset ring-accent-green/25">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="font-semibold text-accent-green-dark dark:text-accent-green-light">Langganan Aktif</p>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Paket: {subscription.planType} • Berakhir:{" "}
              {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("id-ID") : "-"}
            </p>
          </div>
        </div>
      ) : subscription?.status === "pending" ? (
        <div className="flex items-center gap-4 rounded-2xl border border-accent-orange/20 bg-accent-orange/5 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-orange/10 text-accent-orange ring-1 ring-inset ring-accent-orange/25">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="font-semibold text-accent-orange-dark dark:text-accent-orange-light">
              Menunggu Konfirmasi
            </p>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Bukti pembayaran sedang ditinjau oleh admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700">
            <AlertCircle className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-100">Belum Ada Langganan</p>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Pilih paket di bawah untuk memulai.</p>
          </div>
        </div>
      )}

      {/* ── Kuota token ── */}
      {quota?.hasSubscription && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-orange/10 text-accent-orange ring-1 ring-inset ring-accent-orange/25 dark:bg-accent-orange/15 dark:text-accent-orange-light">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-neutral-900 dark:text-white">Kuota Token Hari Ini</span>
                <span className="text-[11px] text-neutral-400">Reset otomatis setiap tengah malam</span>
              </div>
            </div>
            <Badge variant={quotaPercent > 85 ? "danger" : quotaPercent > 60 ? "warning" : "success"}>
              {quotaPercent.toFixed(0)}% terpakai
            </Badge>
          </div>
          <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                quotaPercent > 85
                  ? "bg-accent-pink"
                  : quotaPercent > 60
                    ? "bg-accent-orange"
                    : "bg-gradient-to-r from-accent-blue to-accent-violet"
              )}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {quota.tokensUsedToday.toLocaleString()} / {quota.dailyTokenQuota.toLocaleString()} token terpakai · Sisa:{" "}
            <strong className="text-neutral-800 dark:text-neutral-200">{quota.remaining.toLocaleString()}</strong>
          </p>
        </Card>
      )}

      {/* ── Pricing plans ── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-violet" />
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Pilih Paket
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-accent-blue to-accent-violet px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-soft">
                  <Sparkles className="mr-1 inline h-3 w-3" /> Paling Populer
                </div>
              )}

              <div
                className={cn(
                  "flex h-full flex-col rounded-3xl border p-6 transition-all duration-300",
                  plan.recommended
                    ? "border-transparent bg-gradient-to-b from-accent-blue/[0.06] to-accent-violet/[0.04] shadow-card ring-2 ring-accent-blue/40 hover:-translate-y-1 hover:shadow-lift dark:from-accent-blue/15 dark:to-accent-violet/10"
                    : "border-border-subtle bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-hover-blue dark:border-neutral-800 dark:bg-neutral-900/60"
                )}
              >
                <h4 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                  {plan.name}
                </h4>
                <p className="mt-0.5 text-[11px] font-medium text-neutral-400">{plan.tagline}</p>

                <div className="mb-5 mt-4">
                  <span className="font-display text-[26px] font-extrabold tracking-tight text-neutral-900 tabular-nums dark:text-white">
                    Rp{plan.price.toLocaleString("id-ID")}
                  </span>
                  <span className="ml-1 text-xs font-medium text-neutral-400">{plan.period}</span>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5 border-t border-border-subtle pt-4 dark:border-neutral-800">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.recommended
                            ? "bg-accent-blue/15 text-accent-blue dark:bg-accent-blue/20 dark:text-accent-blue-light"
                            : "bg-accent-green/10 text-accent-green"
                        )}
                      >
                        <CheckCircle className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.recommended ? "primary" : "secondary"}
                  onClick={() => handlePlanSelect(plan.id)}
                  className="w-full"
                >
                  {plan.recommended ? "Pilih Paket Ini" : "Pilih Paket"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Riwayat pembayaran ── */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue ring-1 ring-inset ring-accent-blue/20 dark:bg-accent-blue/15 dark:text-accent-blue-light">
            <CreditCard className="h-4.5 w-4.5" />
          </span>
          Riwayat Pembayaran
        </h3>
        {proofs.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-400">Belum ada riwayat pembayaran.</p>
        ) : (
          <div className="space-y-2.5">
            {proofs.map((p: any) => {
              const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-neutral-50/60 p-4 transition-all hover:bg-white hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-800/40"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      Rp{p.amount.toLocaleString("id-ID")}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {new Date(p.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={badge.variant} dot>
                    {badge.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Modal kirim bukti ── */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setProofFile(null);
        }}
        title="Konfirmasi Pembayaran"
        description="Transfer ke rekening berikut, lalu upload bukti transfer."
        icon={CreditCard}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setProofFile(null);
              }}
            >
              Batal
            </Button>
            <Button onClick={handleSubmitPayment} disabled={submitting}>
              {submitting ? "Mengirim..." : "Kirim Bukti"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-border-subtle bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
            <p className="font-bold text-neutral-900 dark:text-white">Bank BCA</p>
            <p className="font-mono text-sm text-neutral-600 dark:text-neutral-300">1234567890 a/n JagoBot</p>
            <p className="pt-1 font-display text-base font-bold text-accent-blue dark:text-accent-blue-light">
              Jumlah: Rp{Number(transferAmount).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Jumlah Transfer</label>
            <Input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Upload Bukti Transfer
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-sm text-neutral-600 transition-all hover:bg-accent-blue/5 hover:shadow-hover-blue dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-300">
              <Upload className="h-4 w-4 shrink-0" />
              <span className="truncate">{proofFile ? proofFile.name : "Pilih file (JPG/PNG)"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};
