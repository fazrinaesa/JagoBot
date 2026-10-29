import { Mail, Lock, ArrowRight, User, Store } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, Input, FieldLabel } from "../components/ui";
import { apiBaseUrl } from "../lib/apiBase";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = apiBaseUrl();
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_toko: formData.storeName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Selamat! Registrasi JagoBot Berhasil.");
        navigate("/login");
      } else {
        alert(data.message || "Registrasi Gagal, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error saat daftar:", error);
      alert("Tidak dapat terhubung ke server. Pastikan backend sudah menyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mulai Bisnis Pintar Anda"
      subtitle="Daftar gratis dan buat chatbot pertama Anda"
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-accent-blue hover:underline dark:text-accent-blue-light">
            Masuk di sini
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <FieldLabel>Nama</FieldLabel>
            <div className="relative group">
              <User className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
              <Input
                type="text"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Budi"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Toko</FieldLabel>
            <div className="relative group">
              <Store className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
              <Input
                type="text"
                required
                disabled={isLoading}
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="Berkah"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Email Bisnis</FieldLabel>
          <div className="relative group">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
            <Input
              type="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nama@toko.com"
              className="pl-11 py-3.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Kata Sandi</FieldLabel>
          <div className="relative group">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
            <Input
              type="password"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 8 karakter"
              className="pl-11 py-3.5"
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-neutral-300 text-accent-blue focus:ring-accent-blue/30"
          />
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Saya menyetujui{" "}
            <a href="#" className="font-semibold text-accent-blue hover:underline dark:text-accent-blue-light">
              Syarat & Ketentuan
            </a>{" "}
            serta{" "}
            <a href="#" className="font-semibold text-accent-blue hover:underline dark:text-accent-blue-light">
              Kebijakan Privasi
            </a>{" "}
            JagoBot.
          </p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full py-3.5 shadow-lift">
          {isLoading ? "Memproses..." : "Daftar Sekarang"} <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </form>
    </AuthLayout>
  );
};
