import { useEffect, useState } from "react";
import { adminGetPlatformNotifications, getChatLogs } from "../lib/api";
import { Card, PageHeader } from "../components/ui";

type ChatLog = {
  id: number;
  botId?: number;
  userMessage: string;
  aiResponse?: string;
  platform: string;
  createdAt: string;
  botName?: string | null;
  storeName?: string | null;
};

export const ChatLogsPage = () => {
  const isSuperAdmin = localStorage.getItem("role") === "SUPER_ADMIN";
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (isSuperAdmin) {
          const response = await adminGetPlatformNotifications(50);
          if (active) { setLogs(response.data.data ?? []); setError(""); }
          return;
        }
        const botId = Number(localStorage.getItem("activeBotId"));
        if (!botId) { setError("Pilih bot terlebih dahulu."); setLoading(false); return; }
        const response = await getChatLogs(botId);
        if (active) { setLogs(response.data.data ?? []); setError(""); }
      } catch {
        if (active) setError("Log chat gagal dimuat.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isSuperAdmin]);

  return <div className="mx-auto max-w-5xl space-y-5 pb-10">
    <PageHeader title="Log Chat" description={isSuperAdmin
      ? "50 percakapan terbaru dari seluruh toko; diperbarui setiap 5 detik."
      : "50 percakapan terbaru untuk bot aktif; diperbarui setiap 5 detik."} />
    {loading && <p className="text-sm text-neutral-500">Memuat log…</p>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {!loading && !error && logs.length === 0 && <p className="text-sm text-neutral-500">Belum ada percakapan.</p>}
    {logs.map((log) => <Card key={`${log.botId}-${log.id}`} className="space-y-3 p-5">
      <div className="flex flex-wrap justify-between gap-3 text-xs text-neutral-500">
        <span>
          {log.platform}
          {isSuperAdmin && ` · ${[log.storeName, log.botName].filter(Boolean).join(" · ") || `Bot #${log.botId}`}`}
        </span>
        <time>{new Date(log.createdAt).toLocaleString("id-ID")}</time>
      </div>
      <div><p className="text-xs font-bold text-neutral-500">Pelanggan</p><p className="mt-1 text-sm text-neutral-800 dark:text-neutral-100">{log.userMessage}</p></div>
      {log.aiResponse
        ? <div><p className="text-xs font-bold text-accent-blue">JagoBot</p><p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">{log.aiResponse}</p></div>
        : isSuperAdmin && <p className="text-xs text-neutral-400">Pratinjau platform tidak memuat balasan bot.</p>}
    </Card>)}
  </div>;
};

export default ChatLogsPage;
