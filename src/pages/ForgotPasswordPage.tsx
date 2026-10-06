import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, Input, FieldLabel } from "../components/ui";
import api from "../lib/api";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message || "Tautan berhasil dikirim.");
    } catch (error: any) {
      console.error("Error forgot password:", error);
      setMessage(error.response?.data?.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Lupa Kata Sandi"
      subtitle="Masukkan email untuk mengatur ulang"
      footer={
        !message ? (
          <>
            Ingat kata sandi Anda?{" "}
            <Link to="/login" className="font-bold text-accent-blue hover:underline dark:text-accent-blue-light">
              Masuk Kembali
            </Link>
          </>
        ) : undefined
      }
    >
      {message ? (
        <div className="space-y-5 py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600 dark:text-neutral-300">{message}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-blue transition-opacity hover:opacity-80 dark:text-accent-blue-light"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <FieldLabel>Email Terdaftar</FieldLabel>
            <div className="relative group">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
              <Input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@toko.com"
                className="pl-11 py-3.5"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full py-3.5 shadow-lift">
            {isLoading ? "Mengirim..." : "Kirim Tautan"} <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
