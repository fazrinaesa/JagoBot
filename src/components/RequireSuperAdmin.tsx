import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

/**
 * Guard rute: hanya izinkan SUPER_ADMIN.
 *
 * Cara kerja:
 * 1. Cek role dari localStorage (diisi saat login) — cepat, tanpa request.
 * 2. Bila tidak ada (mis. sesi lama), verifikasi ke backend /admin/me.
 * 3. Bila bukan super admin → alihkan ke /dashboard.
 *
 * Ini lapisan UI. Otorisasi sebenarnya tetap di backend (requireSuperAdmin),
 * jadi halaman ini tidak bisa ditembus hanya dengan memalsukan localStorage.
 */
export const RequireSuperAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    const cached = localStorage.getItem("role");
    if (cached === "SUPER_ADMIN") {
      setState("allowed");
      return;
    }

    // Verifikasi ke backend bila cache tidak ada / bukan super admin.
    const token = localStorage.getItem("token");
    if (!token) {
      setState("denied");
      return;
    }

    const base = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";
    fetch(`${base}/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.role === "SUPER_ADMIN") {
          localStorage.setItem("role", "SUPER_ADMIN");
          setState("allowed");
        } else {
          setState("denied");
        }
      })
      .catch(() => { if (!cancelled) setState("denied"); });

    return () => { cancelled = true; };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Memeriksa hak akses...</p>
      </div>
    );
  }

  if (state === "denied") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
