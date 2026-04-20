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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-brand-blue rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        {/* Profile Header */}
        <div className="h-32 bg-brand-orange/20 relative">
            <div className="relative -bottom-12 left-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-brand-blue p-1 shadow-xl border border-white/10">
                  <div className="w-full h-full rounded-2xl bg-brand-blue flex items-center justify-center text-3xl font-bold text-white border border-white/5">
                    BS
                  </div>
                </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
          <p className="text-slate-400">{formData.storeName}</p>
        </div>

        <div className="p-8 border-t border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-orange outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-orange outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Nama Toko</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-orange outline-none transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-orange outline-none transition-all text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Alamat Toko</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-brand-orange outline-none transition-all min-h-[100px] text-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all flex items-center gap-2">
              <Save className="w-5 h-5" /> Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-red-500">Hapus Akun</h4>
          <p className="text-sm text-slate-400">Tindakan ini tidak dapat dibatalkan. Semua data bot Anda akan dihapus.</p>
        </div>
        <button className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all">
          Hapus
        </button>
      </div>
    </div>
  );
};
