import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, Eye } from "lucide-react";
import {
    adminGetPaymentProofs,
    adminReviewPayment,
    adminGetSubscriptions,
} from "../lib/api";

export const AdminPaymentPage: React.FC = () => {
    const [proofs, setProofs] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("pending");
    const [reviewing, setReviewing] = useState<number | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [selectedProof, setSelectedProof] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchData = async () => {
        try {
            const [proofsRes, subsRes] = await Promise.all([
                adminGetPaymentProofs(filter),
                adminGetSubscriptions(),
            ]);
            setProofs(proofsRes.data?.data || []);
            setSubscriptions(subsRes.data?.data || []);
        } catch (err) {
            console.error("Admin payment fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [filter]);

    const handleReview = async (proofId: number, action: "approve" | "reject") => {
        setReviewing(proofId);
        try {
            await adminReviewPayment(proofId, action, adminNote || undefined);
            alert(action === "approve" ? "Pembayaran disetujui!" : "Pembayaran ditolak.");
            setAdminNote("");
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Gagal memproses review.");
        } finally {
            setReviewing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-400">Memuat data pembayaran...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin — Pembayaran</h1>
                <p className="text-slate-400 mt-1">Tinjau bukti transfer dan kelola langganan pengguna.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {["pending", "approved", "rejected", ""].map((f) => (
                    <button
                        key={f || "all"}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            filter === f
                                ? "bg-blue-500 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                    >
                        {f === "" ? "Semua" : f === "pending" ? "Menunggu" : f === "approved" ? "Disetujui" : "Ditolak"}
                    </button>
                ))}
            </div>

            {/* Pending Proofs Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Bukti Pembayaran</h3>
                </div>
                {proofs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Tidak ada data.</div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {proofs.map((p: any) => (
                            <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {p.user?.nama_toko?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">{p.user?.nama_toko}</p>
                                            <p className="text-slate-400 text-xs truncate">{p.user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-white font-semibold">Rp{p.amount.toLocaleString("id-ID")}</p>
                                    <p className="text-slate-400 text-xs">
                                        {new Date(p.createdAt).toLocaleDateString("id-ID")}
                                    </p>
                                    {p.subscription && (
                                        <p className="text-slate-500 text-xs">Plan: {p.subscription.planType}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {p.proofUrl && (
                                        <button
                                            onClick={() => {
                                                setSelectedProof(p);
                                                setShowDetail(true);
                                            }}
                                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                                            title="Lihat bukti"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                    {p.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => handleReview(p.id, "approve")}
                                                disabled={reviewing === p.id}
                                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                                                title="Setujui"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReview(p.id, "reject")}
                                                disabled={reviewing === p.id}
                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                                                title="Tolak"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {p.status !== "pending" && (
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                p.status === "approved"
                                                    ? "bg-emerald-500/20 text-emerald-300"
                                                    : "bg-red-500/20 text-red-300"
                                            }`}
                                        >
                                            {p.status === "approved" ? "Disetujui" : "Ditolak"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Subscriptions */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Semua Langganan</h3>
                </div>
                {subscriptions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Tidak ada langganan.</div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {subscriptions.map((s: any) => (
                            <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {s.user?.nama_toko?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{s.user?.nama_toko}</p>
                                        <p className="text-slate-400 text-xs">{s.user?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white text-sm font-semibold">
                                        {s.planType}
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        Kuota: {s.tokensUsedToday?.toLocaleString() || 0}/{s.dailyTokenQuota?.toLocaleString()}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                        s.status === "active"
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : s.status === "expired"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : "bg-slate-600 text-slate-300"
                                    }`}
                                >
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && selectedProof && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-xl font-bold text-white">Detail Pembayaran</h2>
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-300">
                                <span className="text-slate-500">User:</span> {selectedProof.user?.nama_toko} ({selectedProof.user?.email})
                            </p>
                            <p className="text-slate-300">
                                <span className="text-slate-500">Jumlah:</span> Rp{selectedProof.amount.toLocaleString("id-ID")}
                            </p>
                            <p className="text-slate-300">
                                <span className="text-slate-500">Plan:</span> {selectedProof.subscription?.planType}
                            </p>
                            <p className="text-slate-300">
                                <span className="text-slate-500">Tanggal:</span>{" "}
                                {new Date(selectedProof.createdAt).toLocaleString("id-ID")}
                            </p>
                        </div>
                        {selectedProof.proofUrl && (
                            <div>
                                <p className="text-slate-400 text-sm mb-2">Bukti Transfer:</p>
                                <img
                                    src={`http://localhost:5000${selectedProof.proofUrl}`}
                                    alt="Bukti transfer"
                                    className="rounded-xl border border-slate-700 max-h-64 object-contain w-full"
                                />
                            </div>
                        )}
                        {selectedProof.status === "pending" && (
                            <div className="space-y-3 pt-2">
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Catatan admin (opsional)"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm resize-none"
                                    rows={2}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleReview(selectedProof.id, "approve")}
                                        disabled={reviewing === selectedProof.id}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                    >
                                        {reviewing === selectedProof.id ? "Memproses..." : "Setujui"}
                                    </button>
                                    <button
                                        onClick={() => handleReview(selectedProof.id, "reject")}
                                        disabled={reviewing === selectedProof.id}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                                    >
                                        {reviewing === selectedProof.id ? "Memproses..." : "Tolak"}
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setShowDetail(false);
                                setSelectedProof(null);
                            }}
                            className="w-full py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
