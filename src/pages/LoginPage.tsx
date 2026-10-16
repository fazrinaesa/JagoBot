import { Mail, Lock, ArrowRight, Github } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, Input, FieldLabel } from "../components/ui";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nama_toko", data.nama_toko);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Simpan role untuk menu kondisional & guard admin.
        localStorage.setItem("role", data.user?.role || "USER");

        alert("Berhasil Masuk! Selamat datang kembali.");
        navigate("/dashboard");
      } else {
        alert(data.message || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Error saat login:", error);
      alert("Gagal terhubung ke server. Pastikan backend sudah menyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Kelola chatbot pintar Anda"
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-accent-blue hover:underline dark:text-accent-blue-light">
            Daftar Gratis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <FieldLabel>Email Bisnis</FieldLabel>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel>Kata Sandi</FieldLabel>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-accent-blue transition-opacity hover:opacity-80 dark:text-accent-blue-light"
            >
              Lupa Password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-accent-blue" />
            <Input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-11 py-3.5"
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full py-3.5 shadow-lift">
          {isLoading ? "Mengecek..." : "Masuk Sekarang"} <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle dark:border-neutral-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:bg-neutral-900">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="py-3">
          <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" /> Google
        </Button>
        <Button variant="secondary" className="py-3">
          <Github className="h-4 w-4" /> GitHub
        </Button>
      </div>
    </AuthLayout>
  );
};
