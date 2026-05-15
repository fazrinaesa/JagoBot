import { ArrowLeft, Bell, MessageSquare, Zap, Settings, Info, Check } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";

export const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSettings = searchParams.get('tab') === 'settings';

  // Penyesuaian: Memfilter data agar fokus ke notifikasi tipe 'chat' saja
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
      title: "Chat Baru Diterima",
      desc: "Pelanggan baru menanyakan metode pembayaran via QRIS.",
      time: "15 menit yang lalu",
      type: "chat",
      unread: true
    },
    {
      id: 3,
      title: "Chat Baru Diterima",
      desc: "Ada pertanyaan mengenai estimasi pengiriman ke Bandung.",
      time: "1 jam yang lalu",
      type: "chat",
      unread: false
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "chat": return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "system": return <Zap className="w-4 h-4 text-emerald-500" />;
      case "info": return <Info className="w-4 h-4 text-[#1800ad]" />;
      default: return <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const handleBackToInbox = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-blue dark:text-white">{isSettings ? 'Pengaturan Notifikasi' : 'Notifikasi Chat'}</h2>
          <p className="text-sm text-slate-400 mt-1">{isSettings ? 'Sesuaikan jenis notifikasi yang ingin Anda terima.' : 'Lihat daftar notifikasi masuk terbaru untuk aktivitas pelanggan.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSettings ? (
            <button
              onClick={handleBackToInbox}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Notifikasi
            </button>
          ) : (
            <button
              onClick={() => setSearchParams({ tab: 'settings' })}
              className="rounded-full bg-[#1800ad] text-white px-4 py-2 text-sm font-semibold hover:bg-[#120e70] transition-all"
            >
              Pengaturan Notifikasi
            </button>
          )}
        </div>
      </div>

      {!isSettings ? (
        <div className="bg-brand-blue rounded-2xl border border-white/5 shadow-xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "p-4 flex gap-4 transition-colors hover:bg-white/5 dark:bg-slate-900/5",
                notif.unread ? "bg-[#1800ad]/10" : "bg-transparent"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-blue shadow-sm border border-white/10 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.desc}</p>
              </div>
              {notif.unread && (
                <div className="w-1.5 h-1.5 bg-[#1800ad] rounded-full mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
      ) : (
        <div className="bg-brand-blue p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#1800ad]" /> Pengaturan Notifikasi
          </h3>
          <div className="space-y-5">
            {[
              { label: "Notifikasi Chat Masuk", desc: "Dapatkan pemberitahuan instan saat ada pelanggan yang bertanya." },
              { label: "Laporan Mingguan", desc: "Terima ringkasan performa bot Anda setiap hari Senin." },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-white/10 dark:bg-slate-900/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1800ad]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};