import { ArrowLeft, Bell, MessageSquare, Settings, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Badge, Button, Card, PageHeader } from "../components/ui";
import { adminGetPlatformNotifications, getChatLogs, getUserBots } from "../lib/api";
import { readNotificationSettings, saveNotificationSettings, type NotificationSettings } from "../lib/notificationSettings";

type ChatNotification = {
  id: number;
  botId?: number;
  userMessage: string;
  platform: string;
  createdAt: string;
  botName?: string | null;
  storeName?: string | null;
};
type Bot = { id: number; name?: string; botName?: string };

export const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSettings = searchParams.get("tab") === "settings";
  const isSuperAdmin = localStorage.getItem("role") === "SUPER_ADMIN";
  const [settings, setSettings] = useState(readNotificationSettings);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [lastSeen, setLastSeen] = useState<Record<number, number>>({});
  const [bots, setBots] = useState<Bot[]>([]);
  const [error, setError] = useState("");
  const activeBotId = localStorage.getItem("activeBotId") || "";

  useEffect(() => {
    if (isSuperAdmin) return;
    let active = true;
    getUserBots().then((result) => { if (active) setBots(Array.isArray(result) ? result : []); })
      .catch(() => { if (active) setError("Daftar bot gagal dimuat."); });
    return () => { active = false; };
  }, [isSuperAdmin]);

  const selectedBotIds = useMemo(() => {
    if (isSuperAdmin) return [];
    if (settings.botId === "all") return bots.map((bot) => Number(bot.id)).filter(Boolean);
    if (settings.botId === "active") return activeBotId ? [Number(activeBotId)] : [];
    return bots.some((bot) => String(bot.id) === settings.botId) ? [Number(settings.botId)] : [];
  }, [settings.botId, bots, activeBotId, isSuperAdmin]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!settings.enabled) { setNotifications([]); return; }
      if (!isSuperAdmin && selectedBotIds.length === 0) { setNotifications([]); return; }
      try {
        if (isSuperAdmin) {
          const response = await adminGetPlatformNotifications(settings.limit);
          if (active) { setNotifications(response.data.data ?? []); setError(""); }
        } else {
          const rows = await Promise.all(selectedBotIds.map((botId) => getChatLogs(botId)));
          if (!active) return;
          const merged = rows.flatMap((result) => (result.data.data ?? []).map((chat: ChatNotification) => ({ ...chat, botId: Number(chat.botId) })));
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id);
          setNotifications(merged.slice(0, settings.limit));
          setError("");
        }
      } catch { if (active) setError("Notifikasi gagal dimuat."); }
    };
    const seenKey = isSuperAdmin ? "platformNotificationsSeen" : null;
    setLastSeen(seenKey
      ? { 0: Number(localStorage.getItem(seenKey) || 0) }
      : Object.fromEntries(selectedBotIds.map((id) => [id, Number(localStorage.getItem(`chatNotificationsSeen:${id}`) || 0)])));
    void refresh();
    if (!settings.enabled) return () => { active = false; };
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [selectedBotIds.join(","), settings.enabled, settings.limit, isSuperAdmin]);

  const saveSettings = (next: NotificationSettings) => {
    setSettings(next);
    saveNotificationSettings(next);
  };
  const markAllRead = () => {
    if (isSuperAdmin) {
      const newest = Math.max(lastSeen[0] || 0, ...notifications.map((item) => item.id));
      localStorage.setItem("platformNotificationsSeen", String(newest));
      setLastSeen((current) => ({ ...current, 0: newest }));
      return;
    }
    const next: Record<number, number> = {};
    for (const botId of selectedBotIds) {
      const newest = Math.max(0, ...notifications.filter((item) => item.botId === botId).map((item) => item.id));
      next[botId] = Math.max(lastSeen[botId] || 0, newest);
      localStorage.setItem(`chatNotificationsSeen:${botId}`, String(next[botId]));
    }
    setLastSeen(next);
  };
  const seenFor = (item: ChatNotification) => lastSeen[isSuperAdmin ? 0 : item.botId || 0] || 0;
  const unreadCount = notifications.filter((item) => item.id > seenFor(item)).length;
  const itemLabel = (item: ChatNotification) =>
    isSuperAdmin
      ? [item.storeName, item.botName].filter(Boolean).join(" · ") || `Bot #${item.botId}`
      : bots.find((bot) => bot.id === item.botId)?.name || bots.find((bot) => bot.id === item.botId)?.botName || `Bot #${item.botId}`;

  return <div className="mx-auto max-w-4xl space-y-5 pb-10">
    <PageHeader title={isSettings ? "Pengaturan Notifikasi" : "Notifikasi Chat"}
      description={isSettings
        ? isSuperAdmin ? "Atur notifikasi aktivitas platform pada perangkat ini." : "Atur sumber dan jumlah notifikasi chat pada perangkat ini."
        : isSuperAdmin ? "Aktivitas chat terbaru dari seluruh toko; diperbarui tiap 5 detik." : "Aktivitas chat tersimpan; diperbarui tiap 5 detik saat notifikasi aktif."}
      actions={isSettings ? <Button variant="secondary" onClick={() => setSearchParams({})}><ArrowLeft className="h-4 w-4" /> Kembali</Button> : <div className="flex gap-2">{unreadCount > 0 && <Button variant="ghost" onClick={markAllRead}><Check className="h-4 w-4" /> Tandai Dibaca</Button>}<Button onClick={() => setSearchParams({ tab: "settings" })}><Settings className="h-4 w-4" /> Pengaturan</Button></div>} />
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {isSettings ? <Card className="space-y-6 p-5">
      <label className="flex items-center justify-between gap-4">
        <span><strong className="block text-sm text-neutral-900 dark:text-white">Notifikasi chat masuk</strong><span className="text-xs text-neutral-500">Polling berhenti saat dimatikan.</span></span>
        <input aria-label="Aktifkan notifikasi chat" type="checkbox" checked={settings.enabled} onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })} className="h-5 w-5 accent-blue-600" />
      </label>
      {isSuperAdmin ? <p className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-500 dark:bg-neutral-800/50">Sumber: seluruh toko dan bot di platform (khusus Super Admin).</p> : <label className="block space-y-2"><span className="text-sm font-semibold text-neutral-900 dark:text-white">Sumber bot</span>
        <select value={settings.botId} onChange={(e) => saveSettings({ ...settings, botId: e.target.value })} className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          <option value="active">Bot aktif ({bots.find((bot) => String(bot.id) === activeBotId)?.name || bots.find((bot) => String(bot.id) === activeBotId)?.botName || "pilihan saat ini"})</option>
          <option value="all">Semua bot saya</option>
          {bots.map((bot) => <option key={bot.id} value={String(bot.id)}>{bot.name || bot.botName || `Bot #${bot.id}`}</option>)}
        </select>
      </label>}
      <label className="block space-y-2"><span className="text-sm font-semibold text-neutral-900 dark:text-white">Jumlah notifikasi</span>
        <select value={settings.limit} onChange={(e) => saveSettings({ ...settings, limit: Number(e.target.value) as NotificationSettings["limit"] })} className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          {[5, 10, 20].map((count) => <option key={count} value={count}>{count} notifikasi terbaru</option>)}
        </select>
      </label>
      <p className="text-xs text-neutral-500">Preferensi disimpan di browser ini. Pembaruan otomatis setiap 5 detik selama aplikasi terbuka.</p>
    </Card> : <Card className="overflow-hidden p-2"><div className="divide-y divide-border-subtle dark:divide-neutral-800">
      {!settings.enabled ? <p className="p-5 text-sm text-neutral-500">Notifikasi dimatikan. Aktifkan lewat Pengaturan.</p> : !isSuperAdmin && selectedBotIds.length === 0 ? <p className="p-5 text-sm text-neutral-500">Pilih bot untuk melihat notifikasi.</p> : notifications.length === 0 ? <p className="p-5 text-sm text-neutral-500">Belum ada chat baru.</p> : notifications.map((item, index) => <Link key={`${item.botId}-${item.id}-${index}`} to="/dashboard/chat-logs" className={`flex gap-4 rounded-2xl p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${item.id > seenFor(item) ? "bg-accent-blue/5" : ""}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10"><MessageSquare className="h-4 w-4 text-accent-blue" /></span>
        <span className="min-w-0 flex-1"><span className="mb-1 flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-neutral-900 dark:text-white">Chat baru · {item.platform} · {itemLabel(item)}</strong><time className="text-[11px] text-neutral-400">{new Date(item.createdAt).toLocaleString("id-ID")}</time></span><span className="block truncate text-xs text-neutral-500">{item.userMessage}</span></span>
        {item.id > seenFor(item) && <Badge variant="info" className="self-center">Baru</Badge>}
      </Link>)}
    </div></Card>}
    <p className="flex items-center gap-2 text-xs text-neutral-400"><Bell className="h-3.5 w-3.5" />Pengaturan hanya berlaku pada browser/perangkat ini.</p>
  </div>;
};

export default NotificationsPage;
