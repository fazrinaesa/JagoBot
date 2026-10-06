import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, Input, FieldLabel } from "../components/ui";
import api from "../lib/api";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("⚠️ Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!token || !id) {
      alert("⚠️ Tautan tidak valid. Harap gunakan tautan dari email Anda.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/reset-password", { id, token, password });
      setMessage(response.data.message || "Kata sandi berhasil diatur ulang.");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error reset password:", error);
      setMessage(error.response?.data?.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Atur Ulang Kata Sandi"
      subtitle="Masukkan kata sandi baru Anda"
      footer={
        !isSuccess ? (
          <>
            Batal mengubah kata sandi?{" "}
            <Link to="/login" className="font-bold text-accent-blue hover:underline dark:text-accent-blue-light">
              Masuk Kembali
            </Link>
          </>
        ) : undefined
      }
    >
      {isSuccess ? (
        <div className="space-y-5 py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium leading-relaxed text-accent-green-dark dark:text-accent-green-light">
            {message}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Mengarahkan ke halaman masuk...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <FieldLabel>Kata Sandi Baru</FieldLabel>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
              <Input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="pl-11 py-3.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Konfirmasi Kata Sandi</FieldLabel>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
              <Input
                type="password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="pl-11 py-3.5"
              />
            </div>
          </div>

          {message && (
            <p className="text-center text-xs font-semibold text-accent-pink">{message}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full py-3.5 shadow-lift">
            {isLoading ? "Menyimpan..." : "Simpan Kata Sandi"} <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
