import { ArrowLeft, User, Mail, Store, Phone, MapPin, Camera, Save, AlertCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, uploadAvatar, deleteUserAccount } from "../lib/api";
import { Button, Card, Input, PageHeader, Textarea } from "../components/ui";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        const data = res.data;
        setFormData({
          name: data.nama_lengkap || "",
          email: data.email || "",
          storeName: data.nama_toko || "",
          phone: data.whatsapp || "",
          address: data.alamat || "",
          avatarUrl: data.avatarUrl || "",
        });
      } catch (error) {
        console.error("Gagal memuat profil", error);
        showToast("Gagal memuat profil", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        nama_lengkap: formData.name,
        email: formData.email,
        nama_toko: formData.storeName,
        whatsapp: formData.phone,
        alamat: formData.address,
      });

      // Sinkronisasi ke Navbar
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const userData = JSON.parse(rawUser);
        userData.nama = formData.name;
        localStorage.setItem("user", JSON.stringify(userData));
      }
      localStorage.setItem("nama_toko", formData.storeName);
      window.dispatchEvent(new Event("storage"));

      showToast("Profil berhasil diperbarui", "success");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal memperbarui profil";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadAvatar(file);
      const newAvatarUrl = res.data.avatarUrl;
      setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      showToast("Foto profil berhasil diunggah", "success");

      localStorage.setItem("avatarUrl", newAvatarUrl);
      window.dispatchEvent(new Event("storage"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengunggah foto profil";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "HAPUS") {
      showToast('Ketik "HAPUS" untuk konfirmasi', "error");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount();
      localStorage.clear();
      navigate("/");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menghapus akun", "error");
      setIsDeleting(false);
    }
  };

  // Ambil inisial untuk avatar fallback
  const initials = formData.name
    ? formData.name.substring(0, 2).toUpperCase()
    : formData.storeName
      ? formData.storeName.substring(0, 2).toUpperCase()
      : "JB";

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-accent-blue dark:text-accent-blue-light" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl space-y-5 pb-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-soft transition-all hover:bg-neutral-50 hover:text-neutral-900 focus-ring dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-8 top-20 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-pop animate-slide-in-right ${
            toast.type === "success"
              ? "border-accent-green/20 bg-white text-accent-green-dark dark:bg-neutral-900 dark:text-accent-green-light"
              : "border-accent-pink/20 bg-white text-accent-pink-dark dark:bg-neutral-900 dark:text-accent-pink-light"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Kartu profil */}
      <Card className="overflow-hidden">
        {/* Header profil */}
        <div className="relative h-36 bg-gradient-to-br from-brand-blue via-brand-navy to-[#1a2f5e]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.35),_transparent_55%)]" />
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent-violet/25 blur-3xl" />
        </div>

        <div className="px-6 pb-2">
          <div className="relative z-10 -mt-12 mb-4">
            <div className="relative group cursor-pointer w-fit" onClick={handleAvatarClick}>
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white p-0.5 shadow-card dark:border-neutral-900 dark:bg-neutral-900">
                {formData.avatarUrl ? (
                  <img
                    src={
                      /^https?:\/\//i.test(formData.avatarUrl)
                        ? formData.avatarUrl
                        : `${import.meta.env.VITE_API_URL || ""}${formData.avatarUrl}`
                    }
                    alt="Avatar"
                    className="h-full w-full rounded-full border border-border-subtle bg-white object-cover dark:border-neutral-700"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet font-display text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
              <button className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-950/40 opacity-0 transition-opacity hover:opacity-100 focus-ring" disabled={isUploading}>
                {isUploading ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {formData.name || "Nama Belum Diatur"}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-400">
              @{formData.storeName.toLowerCase().replace(/\s/g, "") || "toko"}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" /> {formData.storeName || "Toko"}
              </span>
              {formData.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {formData.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form edit */}
        <div className="space-y-4 border-t border-border-subtle p-6 dark:border-neutral-800">
          <PageHeader title="Informasi Akun" className="mb-2" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nama Lengkap</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Budi Santoso"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Email Bisnis</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nama Toko</label>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Misal: 081234567890"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Alamat Toko</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap toko Anda"
                className="min-h-[80px] pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="px-8">
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-pink/20 bg-accent-pink/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <Trash2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-accent-pink-dark dark:text-accent-pink-light">Hapus Akun</h4>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Tindakan ini tidak dapat dibatalkan. Semua data bot Anda akan dihapus permanen.
            </p>
          </div>
        </div>
        <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} className="shrink-0">
          Hapus
        </Button>
      </div>

      {/* Modal konfirmasi hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in bg-neutral-950/50 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm space-y-4 rounded-3xl border border-accent-pink/20 bg-white p-6 shadow-pop animate-pop-in dark:bg-neutral-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Hapus Akun Secara Permanen?
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Apakah Anda yakin? Semua data bot dan riwayat chat akan dihapus secara permanen.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Ketik <strong className="text-neutral-800 dark:text-neutral-200">HAPUS</strong> untuk melanjutkan:
              </label>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="focus:border-accent-pink/60 focus:ring-accent-pink/10"
              />
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "HAPUS" || isDeleting}
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                Konfirmasi Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
