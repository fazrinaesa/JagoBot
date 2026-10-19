import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  Shield,
  User as UserIcon,
  Store,
  Bot,
  Power,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { AdminUser, adminGetUsers, adminUpdateUserRole, adminUpdateUserStatus } from "../lib/api";
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Select, StatCard } from "../components/ui";

/**
 * Halaman Manajemen Pengguna (Fase 6) — hanya SUPER_ADMIN.
 * Mengubah peran (USER/ADMIN/SUPER_ADMIN) dan mengaktifkan/menonaktifkan akun.
 */

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

const ROLE_META: Record<string, { label: string; variant: any; icon: any }> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "primary", icon: ShieldCheck },
  ADMIN: { label: "Admin", variant: "warning", icon: Shield },
  USER: { label: "User", variant: "neutral", icon: UserIcon },
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 20 });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, roleFilter]);

  // Pencarian ditunda agar tidak membanjiri server tiap ketikan.
  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) load();
      else setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const changeRole = async (u: AdminUser, role: AdminUser["role"]) => {
    if (role === u.role) return;
    setBusyId(u.id);
    setNotice(null);
    try {
      await adminUpdateUserRole(u.id, role);
      setNotice(`Peran ${u.email} diubah menjadi ${ROLE_META[role].label}.`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal mengubah peran.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (u: AdminUser) => {
    setBusyId(u.id);
    setNotice(null);
    try {
      await adminUpdateUserStatus(u.id, !u.isActive);
      setNotice(`Akun ${u.email} ${!u.isActive ? "diaktifkan" : "dinonaktifkan"}.`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal mengubah status akun.");
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = users.filter(u => u.isActive).length;
  const superCount = users.filter(u => u.role === "SUPER_ADMIN").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola peran dan status akun seluruh pengguna."
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Muat ulang
          </Button>
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="TOTAL PENGGUNA" value={String(pagination.total)} icon={Users} accentColor="blue" />
        <StatCard title="AKTIF (HALAMAN INI)" value={String(activeCount)} icon={Power} accentColor="green" />
        <StatCard title="SUPER ADMIN" value={String(superCount)} icon={ShieldCheck} accentColor="violet" />
      </div>

      <Card className="overflow-hidden">
        {/* Filter */}
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700/60">
          <div>
            <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Daftar Pengguna
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {pagination.total} pengguna terdaftar
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama toko / email..."
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">Semua peran</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-16"><LoadingState label="Memuat pengguna..." /></div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Tidak ada pengguna ditemukan"
            description={search ? "Coba kata kunci lain." : "Belum ada pengguna terdaftar."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Pengguna</th>
                  <th className="px-5 py-3 font-semibold">Peran</th>
                  <th className="px-5 py-3 text-right font-semibold">Bot</th>
                  <th className="px-5 py-3 font-semibold">Login Terakhir</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const meta = ROLE_META[u.role] || ROLE_META.USER;
                  const RoleIcon = meta.icon;
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            <Store className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-800 dark:text-neutral-100">{u.nama_toko}</p>
                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={u.role}
                          disabled={busy}
                          onChange={(e) => changeRole(u, e.target.value as AdminUser["role"])}
                          className="min-w-[130px] text-xs"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </Select>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                        <span className="inline-flex items-center gap-1">
                          <Bot className="h-3 w-3" /> {u.totalBots}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {fmtDate(u.lastLoginAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.isActive ? "success" : "danger"} dot>
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant={u.isActive ? "secondary" : "primary"}
                          disabled={busy}
                          onClick={() => toggleStatus(u)}
                          className="text-xs"
                        >
                          <Power className="mr-1.5 h-3.5 w-3.5" />
                          {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginasi */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 dark:border-neutral-700/60">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Halaman {pagination.page} dari {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs">
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </Button>
              <Button
                variant="secondary"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="text-xs"
              >
                Berikutnya <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Catatan: Anda tidak dapat menurunkan peran atau menonaktifkan akun Anda sendiri — sistem mencegahnya
        agar panel admin tidak terkunci.
      </p>
    </div>
  );
};
