import { ArrowLeft, Bell, MessageSquare, Zap, Settings, Info, Check } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";
import { Badge, Button, Card, PageHeader, Toggle } from "../components/ui";

export const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSettings = searchParams.get("tab") === "settings";

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Chat Baru Diterima",
      desc: "Pelanggan baru menanyakan harga produk 'Kopi Gayo'.",
      time: "2 menit yang lalu",
      type: "chat",
      unread: true,
    },
    {
      id: 2,
      title: "Chat Baru Diterima",
      desc: "Pelanggan baru menanyakan metode pembayaran via QRIS.",
      time: "15 menit yang lalu",
      type: "chat",
      unread: true,
    },
    {
      id: 3,
      title: "Chat Baru Diterima",
      desc: "Ada pertanyaan mengenai estimasi pengiriman ke Bandung.",
      time: "1 jam yang lalu",
      type: "chat",
      unread: false,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4 text-accent-blue dark:text-accent-blue-light" />;
      case "system":
        return <Zap className="h-4 w-4 text-accent-green dark:text-accent-green-light" />;
      case "info":
        return <Info className="h-4 w-4 text-accent-violet dark:text-accent-violet-light" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "chat":
        return "bg-accent-blue/10";
      case "system":
        return "bg-accent-green/10";
      case "info":
        return "bg-accent-violet/10";
      default:
        return "bg-neutral-100 dark:bg-neutral-800";
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleBackToInbox = () => {
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-10">
      <PageHeader
        title={isSettings ? "Pengaturan Notifikasi" : "Notifikasi Chat"}
        description={
          isSettings
            ? "Sesuaikan jenis notifikasi yang ingin Anda terima."
            : "Lihat daftar notifikasi masuk terbaru untuk aktivitas pelanggan."
        }
        actions={
          isSettings ? (
            <Button variant="secondary" onClick={handleBackToInbox}>
              <ArrowLeft className="h-4 w-4" /> Kembali ke Notifikasi
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" onClick={markAllRead}>
                  <Check className="h-4 w-4" /> Tandai Dibaca
                </Button>
              )}
              <Button onClick={() => setSearchParams({ tab: "settings" })}>
                <Settings className="h-4 w-4" /> Pengaturan
              </Button>
            </div>
          )
        }
      />

      {!isSettings ? (
        <Card className="overflow-hidden p-2">
          <div className="divide-y divide-border-subtle dark:divide-neutral-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex gap-4 rounded-2xl p-4 transition-colors",
                  notif.unread ? "bg-accent-blue/5" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    getIconBg(notif.type)
                  )}
                >
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{notif.title}</h4>
                    <span className="text-[11px] font-medium text-neutral-400">{notif.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{notif.desc}</p>
                </div>
                {notif.unread && (
                  <Badge variant="info" className="self-center">Baru</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="mb-5 flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
              <Settings className="h-4.5 w-4.5" />
            </span>
            Pengaturan Notifikasi
          </h3>
          <div className="space-y-5">
            {[
              {
                label: "Notifikasi Chat Masuk",
                desc: "Dapatkan pemberitahuan instan saat ada pelanggan yang bertanya.",
              },
              {
                label: "Laporan Mingguan",
                desc: "Terima ringkasan performa bot Anda setiap hari Senin.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
