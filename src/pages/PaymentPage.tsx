import React, { useState, useEffect } from "react";
import { CreditCard, Upload, Clock, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import {
    getMySubscription,
    getMyPaymentProofs,
    getTokenQuota,
    submitPaymentProof,
} from "../lib/api";

const PRICING = [
    {
        id: "basic",
        name: "Paket Dasar",
        price: 349000,
        period: "sekali (setup)",
        features: ["Setup awal", "Integrasi WhatsApp", "Integrasi Spreadsheet", "2 minggu support"],
        recommended: false,
    },
    {
        id: "whatsapp",
        name: "Add-on WhatsApp",
        price: 139000,
        period: "/bulan",
        features: ["Bot WhatsApp aktif", "Kuota 15.000 token/hari", "Auto-reply pelanggan"],
        recommended: true,
    },
    {
        id: "telegram",
        name: "Add-on Telegram",
        price: 95999,
        period: "/bulan",
        features: ["Bot Telegram aktif", "Kuota 10.000 token/hari", "Channel & group support"],
        recommended: false,
    },
    {
        id: "whatsapp+telegram",
        name: "Combo WA + Telegram",
        price: 234999,
        period: "/bulan",
        features: ["Kedua channel aktif", "Kuota 20.000 token/hari", "Prioritas support"],
        recommended: false,
    },
];

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-400">Memuat data langganan...</div>
            </div>
        );
    }

    const isActive = subscription?.status === "active";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Pembayaran & Langganan</h1>
                <p className="text-slate-400 mt-1">Kelola paket dan status langganan bot Anda.</p>
            </div>

            {/* Subscription Status Banner */}
            {isActive ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                        <p className="text-emerald-300 font-semibold">Langganan Aktif</p>
                        <p className="text-emerald-400/70 text-sm">
                            Paket: {subscription.planType} • Berakhir:{" "}
                            {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("id-ID") : "-"}
                        </p>
                    </div>
                </div>
            ) : subscription?.status === "pending" ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
                    <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                        <p className="text-amber-300 font-semibold">Menunggu Konfirmasi</p>
                        <p className="text-amber-400/70 text-sm">
                            Bukti pembayaran sedang ditinjau oleh admin.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-slate-300 font-semibold">Belum Ada Langganan</p>
                        <p className="text-slate-400 text-sm">Pilih paket di bawah untuk memulai.</p>
                    </div>
                </div>
            )}

            {/* Token Quota */}
            {quota?.hasSubscription && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-semibold">Kuota Token Hari Ini</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                        <div
                            className="bg-yellow-400 h-3 rounded-full transition-all"
                            style={{
                                width: `${Math.min((quota.tokensUsedToday / quota.dailyTokenQuota) * 100, 100)}%`,
                            }}
                        />
                    </div>
                    <p className="text-slate-400 text-sm">
                        {quota.tokensUsedToday.toLocaleString()} / {quota.dailyTokenQuota.toLocaleString()} token terpak
                        ai
                        {" • "}Sisa: {quota.remaining.toLocaleString()} token
                    </p>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {PRICING.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-slate-800/60 border rounded-2xl p-5 flex flex-col transition-all hover:shadow-lg ${
                            plan.recommended
                                ? "border-blue-500/40 shadow-blue-500/10"
                                : "border-slate-700"
                        }`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                                Populer
                            </div>
                        )}
                        <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                        <div className="mt-2 mb-4">
                            <span className="text-2xl font-bold text-white">
                                Rp{plan.price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-slate-400 text-sm">{plan.period}</span>
                        </div>
                        <ul className="space-y-2 mb-6 flex-1">
                            {plan.features.map((f) => (
                                <li key={f} className="text-slate-300 text-sm flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                plan.recommended
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-slate-700 hover:bg-slate-600 text-white"
                            }`}
                        >
                            Pilih Paket
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment History */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Riwayat Pembayaran
                </h3>
                {proofs.length === 0 ? (
                    <p className="text-slate-400 text-sm">Belum ada riwayat pembayaran.</p>
                ) : (
                    <div className="space-y-3">
                        {proofs.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3">
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        Rp{p.amount.toLocaleString("id-ID")}
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        {new Date(p.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {p.status === "pending" && (
                                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                                            Menunggu
                                        </span>
                                    )}
                                    {p.status === "approved" && (
                                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                                            Disetujui
                                        </span>
                                    )}
                                    {p.status === "rejected" && (
                                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                                            Ditolak
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Submission Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-bold text-white">Konfirmasi Pembayaran</h2>
                        <p className="text-slate-400 text-sm">
                            Transfer ke rekening berikut, lalu upload bukti transfer:
                        </p>
                        <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                            <p className="text-white font-semibold">Bank BCA</p>
                            <p className="text-slate-300">1234567890 a/n JagoBot</p>
                            <p className="text-white font-semibold mt-2">Jumlah: Rp{Number(transferAmount).toLocaleString("id-ID")}</p>
                        </div>
                        <div>
                            <label className="text-sm text-slate-300 block mb-1">Jumlah Transfer</label>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-300 block mb-1">Upload Bukti Transfer</label>
                            <div className="flex items-center gap-3">
                                <label className="flex-1 cursor-pointer bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-600 transition-colors">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    {proofFile ? proofFile.name : "Pilih file (JPG/PNG)"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setProofFile(null);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmitPayment}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                {submitting ? "Mengirim..." : "Kirim Bukti"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
