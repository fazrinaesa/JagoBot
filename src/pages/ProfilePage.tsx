import { User, Mail, Store, Phone, MapPin, Camera, Save } from "lucide-react";
import { useState } from "react";

export const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "Budi Santoso",
    email: "budi@warungberkah.id",
    storeName: "Warung Berkah",
    phone: "081234567890",
    address: "Jl. Merdeka No. 123, Jakarta Selatan"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <div className="bg-brand-blue rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        {/* Profile Header - Twitter/X Style */}
        <div className="h-40 bg-[#1800ad]/20 relative"> {/* Banner lebih tinggi sedikit */}
          <div className="absolute -bottom-12 left-6"> {/* Foto profil menimpa banner */}
            <div className="relative group">
              {/* Foto profil bulat sempurna dengan border tebal khas X */}
              <div className="w-24 h-24 rounded-full bg-brand-blue p-1 shadow-xl border-4 border-brand-blue">
                <div className="w-full h-full rounded-full bg-brand-blue flex items-center justify-center text-3xl font-bold text-white border border-white/5 overflow-hidden">
                  BS
                </div>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button - Positioned like "Edit Profile" on X */}
        <div className="flex justify-end pt-4 px-6">
          <button className="bg-transparent border border-white/20 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-white/5 dark:bg-slate-900/5 transition-all">
            Edit Profil
          </button>
        </div>

        {/* Profile Identity Text */}
        <div className="mt-4 pb-6 px-8">
          <h2 className="text-2xl font-black text-white tracking-tight">{formData.name}</h2>
          <p className="text-sm text-slate-400">@{formData.storeName.toLowerCase().replace(/\s/g, '')}</p>

          {/* Tambahan Info bar khas X */}
          <div className="flex flex-wrap gap-4 mt-3 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> {formData.storeName}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Jakarta, Indonesia
            </div>
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5 focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad]/20 outline-none transition-all min-h-[80px] text-white text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button className="bg-[#1800ad] text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-[#1800ad]/20 hover:bg-[#1800ad]/90 active:scale-[0.98] transition-all flex items-center gap-2 ml-auto">
              <Save className="w-4 h-4" /> Simpan Perubahan
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
        <button className="px-5 py-2 bg-white dark:bg-slate-900 border border-[#1800ad]/20 text-[#1800ad] font-bold text-xs rounded-full hover:bg-[#1800ad]/5 transition-all">
          Hapus
        </button>
      </div>
    </div>
  );
};