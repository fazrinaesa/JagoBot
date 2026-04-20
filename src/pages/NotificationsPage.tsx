import { Bell, MessageSquare, Zap, Settings, Info, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "Chat Baru Diterima", 
      desc: "Pelanggan baru menanyakan harga produk 'Kopi Gayo'.", 
      time: "2 menit yang lalu", 
      type: "chat",
      unread: true 
    },
    { 
      id: 2, 
      title: "Integrasi WhatsApp Aktif", 
      desc: "Nomor WhatsApp Anda telah berhasil terhubung ke JagoBot.", 
      time: "1 jam yang lalu", 
      type: "system",
      unread: false 
    },
    { 
      id: 3, 
      title: "Pembaruan Sistem", 
      desc: "Kami baru saja merilis fitur 'Kepribadian Kustom' yang lebih cerdas.", 
      time: "5 jam yang lalu", 
      type: "info",
      unread: false 
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "chat": return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "system": return <Zap className="w-5 h-5 text-emerald-500" />;
      case "info": return <Info className="w-5 h-5 text-brand-orange" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-blue">Notifikasi</h2>
        <button className="text-sm font-bold text-brand-orange hover:underline">
          Tandai semua sudah dibaca
        </button>
      </div>

      <div className="bg-brand-blue rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="divide-y divide-white/10">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-6 flex gap-4 transition-colors hover:bg-white/5",
                notif.unread ? "bg-brand-orange/10" : "bg-transparent"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-blue shadow-sm border border-white/10 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white">{notif.title}</h4>
                  <span className="text-xs text-slate-400">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{notif.desc}</p>
              </div>
              {notif.unread && (
                <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-brand-blue p-8 rounded-3xl border border-white/5 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-orange" /> Pengaturan Notifikasi
        </h3>
        <div className="space-y-6">
          {[
            { label: "Notifikasi Chat Baru", desc: "Dapatkan pemberitahuan saat ada pelanggan yang bertanya." },
            { label: "Laporan Mingguan", desc: "Terima ringkasan performa bot Anda setiap hari Senin." },
            { label: "Pembaruan Sistem", desc: "Info tentang fitur baru dan pemeliharaan sistem." },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
