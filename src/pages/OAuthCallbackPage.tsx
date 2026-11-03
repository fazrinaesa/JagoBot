import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiBaseUrl } from "../lib/apiBase";

/**
 * Halaman tujuan setelah OAuth Google/GitHub.
 * Menyimpan sesi dengan kunci yang sama seperti login email/password,
 * lalu mengarahkan ke dashboard.
 */
export const OAuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Menyelesaikan proses masuk...");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get("token");
    if (!token) {
      setMessage("Token masuk tidak ditemukan. Silakan coba lagi.");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }

    const run = async () => {
      try {
        const base = `${apiBaseUrl()}/api`;
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, botsRes] = await Promise.all([
          fetch(`${base}/user/profile`, { headers }),
          fetch(`${base}/dashboard/user-bots`, { headers }),
        ]);

        if (!profileRes.ok) throw new Error("Gagal mengambil profil akun.");

        const profile = await profileRes.json();
        const botsJson = botsRes.ok ? await botsRes.json() : { data: [] };
        const bots = Array.isArray(botsJson?.data) ? botsJson.data : Array.isArray(botsJson) ? botsJson : [];

        // Role diambil dari isi token, sama seperti yang dilakukan layout.
        let role = "USER";
        try {
          const payload = JSON.parse(atob(token.split(".")[1] || ""));
          role = payload.role || "USER";
        } catch {
          /* biarkan default USER */
        }

        const user = {
          id: profile.id,
          email: profile.email,
          nama_toko: profile.nama_toko,
          botId: bots[0]?.id,
          role,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("nama_toko", profile.nama_toko || "");
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);
        if (bots[0]?.id) localStorage.setItem("activeBotId", String(bots[0].id));

        navigate(role === "SUPER_ADMIN" ? "/dashboard/admin" : "/dashboard", { replace: true });
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setMessage(error?.message || "Gagal menyelesaikan proses masuk.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      }
    };

    run();
  }, [navigate, params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-white p-8 text-center shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
        <h1 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Masuk dengan akun Anda</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
      </div>
    </div>
  );
};
