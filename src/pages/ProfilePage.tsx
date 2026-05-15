import { ArrowLeft, User, Mail, Store, Phone, MapPin, Camera, Save, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, uploadAvatar, deleteUserAccount } from "../lib/api";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    phone: "",
    address: "",
    avatarUrl: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete Modal State
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
          avatarUrl: data.avatarUrl || ""
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
        alamat: formData.address
      });
      
      // Sinkronisasi ke Navbar
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const userData = JSON.parse(rawUser);
        userData.nama = formData.name;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      localStorage.setItem('nama_toko', formData.storeName);
      window.dispatchEvent(new Event('storage'));

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
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      showToast("Foto profil berhasil diunggah", "success");
      
      // Update localstorage
      localStorage.setItem('avatarUrl', newAvatarUrl);
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengunggah foto profil";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex justify-center items-center h-[60vh]">
        <RefreshCw className="w-8 h-8 text-[#1800ad] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10 relative">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/50 dark:bg-slate-950/60 px-3 py-2 rounded-full border border-white/10 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-right-5 fade-in duration-300 ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="bg-brand-blue rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        {/* Profile Header - Twitter/X Style */}
        <div className="h-40 bg-[#1800ad]/20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,_rgba(24,0,173,0.28),_transparent_45%)]" />
          <div className="absolute -bottom-8 left-6 w-44 h-44 rounded-full bg-[#1800ad] opacity-80 blur-2xl" />
          <div className="absolute -bottom-6 left-10 w-32 h-32 rounded-full bg-[#0f255d] opacity-70 blur-2xl" />
          <div className="absolute -bottom-12 left-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full bg-white/10 p-1 shadow-xl border-4 border-white/10 backdrop-blur-sm">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border border-white/5 bg-white" />
                ) : (
                  <div className="w-full h-full rounded-full bg-brand-blue flex items-center justify-center text-3xl font-bold text-white border border-white/5 overflow-hidden">
                    {initials}
                  </div>
                )}
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" disabled={isUploading}>
                {isUploading ? <RefreshCw className="text-white w-5 h-5 animate-spin" /> : <Camera className="text-white w-5 h-5" />}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 px-6 h-12"></div>

        {/* Profile Identity Text */}
        <div className="mt-4 pb-6 px-8">
          <h2 className="text-2xl font-black text-white tracking-tight">{formData.name || "Nama Belum Diatur"}</h2>
          <p className="text-sm text-slate-400">@{formData.storeName.toLowerCase().replace(/\s/g, '') || "toko"}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> {formData.storeName || "Toko"}
            </div>
            {formData.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {formData.address}
              </div>
            )}
          </div>
        </div>

        {/* Input Form Section */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Budi Santoso"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider ml-1">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider ml-1">Nama Toko</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider ml-1">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Misal: 081234567890"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white uppercase tracking-wider ml-1">Alamat Toko</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap toko Anda"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all min-h-[80px] text-white text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-[#1800ad] text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-[#1800ad]/20 hover:bg-[#1800ad]/90 active:scale-[0.98] transition-all flex items-center gap-2 ml-auto disabled:opacity-70"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1800ad]/5 p-5 rounded-2xl border border-[#1800ad]/10 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-[#1800ad] text-sm">Hapus Akun</h4>
          <p className="text-[11px] text-slate-400">Tindakan ini tidak dapat dibatalkan. Semua data bot Anda akan dihapus.</p>
        </div>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-5 py-2 bg-white dark:bg-slate-900 border border-[#1800ad]/20 text-[#1800ad] font-bold text-xs rounded-full hover:bg-[#1800ad]/5 transition-all"
        >
          Hapus
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-500/20">
            <h3 className="text-lg font-bold text-red-500 mb-2">Hapus Akun Secara Permanen?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Apakah Anda yakin? Semua data bot dan riwayat chat akan dihapus secara permanen.
            </p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Ketik <strong className="text-slate-800 dark:text-slate-200">HAPUS</strong> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "HAPUS" || isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Konfirmasi Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};