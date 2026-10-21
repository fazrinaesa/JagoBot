import { useEffect, useState } from "react";
import { CreditCard, MessageSquare, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api, { adminGetOverview, adminGetPaymentProofs } from "../lib/api";
import { Card, PageHeader, StatCard } from "../components/ui";

interface Overview {
  totalUsers: number;
  totalBots: number;
  totalKnowledgeBases: number;
  totalChats: number;
}

export const AdminOverviewPage = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/admin/overview"), adminGetPaymentProofs("pending")])
      .then(([overview, payments]) => {
        setData(overview.data);
        setPendingPayments((payments.data?.data || []).length);
      })
      .catch(() => setError("Gagal memuat ringkasan platform."));
  }, []);

  const cards = [
    { label: "Pengguna", value: data?.totalUsers, icon: Users },
    { label: "Toko / Bot", value: data?.totalBots, icon: Store },
    { label: "Percakapan", value: data?.totalChats, icon: MessageSquare },
    { label: "Pembayaran menunggu", value: pendingPayments, icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <PageHeader title="Ringkasan Platform" description="Operasional global JagoBot." />
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon }) => (
          <StatCard key={label} title={label.toUpperCase()} value={value == null ? "—" : String(value)} icon={icon} accentColor="blue" />
        ))}
      </div>
      <Card className="p-5">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Akses cepat</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link className="text-accent-blue hover:underline" to="/dashboard/admin/payment">Tinjau pembayaran</Link>
          <Link className="text-accent-blue hover:underline" to="/dashboard/admin/users">Kelola pengguna</Link>
          <Link className="text-accent-blue hover:underline" to="/dashboard/admin/api-usage">Pantau penggunaan API</Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminOverviewPage;
