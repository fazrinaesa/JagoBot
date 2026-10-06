import { Globe, Code, Copy, Check, ExternalLink, X, Database, Plug } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Badge, Button, Card, PageHeader } from "../components/ui";

type ConnState = "connected" | "disconnected" | "coming-soon";

const CHANNEL_META: Record<
  string,
  { badge: { variant: "success" | "warning" | "neutral"; label: string; dot?: boolean; pulseDot?: boolean }; hint: string }
> = {
  connected: {
    badge: { variant: "success", label: "Terhubung", dot: true },
    hint: "Aktif melayani pelanggan",
  },
  disconnected: {
    badge: { variant: "warning", label: "Belum Terhubung", dot: true },
    hint: "Hubungkan untuk mengaktifkan",
  },
  "coming-soon": {
    badge: { variant: "neutral", label: "Segera Hadir" },
    hint: "Sedang dalam pengembangan",
  },
};

export const IntegrationSettings = () => {
  // STEP 1: Identifikasi data bot aktif
  const [activeBotId, setActiveBotId] = useState<string | null>(localStorage.getItem("activeBotId"));

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveBotId(localStorage.getItem("activeBotId"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // STEP 2 & 3: State kontrol modal dialog
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // STEP 5: Buat string kode snippet secara dinamis
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const snippetCode = `<script \n  src="${apiUrl}/widget/jagobot.js" \n  data-bot-id="${activeBotId || "JB-PENDING"}"></script>`;

  // STEP 6: Logika "copy to clipboard" dengan feedback visual
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin kode integrasi: ", err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10">
      <PageHeader
        title="Integrasi"
        description="Hubungkan JagoBot ke channel komunikasi bisnis Anda."
      />

      {/* Indikator bot aktif */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
            <Database className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Bot ID Teridentifikasi
          </span>
        </div>
        <code className="rounded-xl border border-border-subtle bg-neutral-50 px-3 py-1.5 font-mono text-xs font-bold text-accent-blue dark:border-neutral-700 dark:bg-neutral-800 dark:text-accent-blue-light">
          {activeBotId || "BELUM MEMILIH PROJECT"}
        </code>
      </div>

      {/* ── Grid channel terintegrasi ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* WhatsApp */}
        <Card accentColor="green" hover className="relative flex flex-col overflow-hidden p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green ring-1 ring-inset ring-accent-green/25 dark:bg-accent-green/15 dark:text-accent-green-light">
                {/* Ikon WhatsApp sederhana berbasis SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z" />
                </svg>
              </div>
            </div>
            <Badge variant="warning" dot>Belum Terhubung</Badge>
          </div>

          <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            WhatsApp Business
          </h3>
          <p className="mb-5 mt-1 flex-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {CHANNEL_META.disconnected.hint} — balas pesan pelanggan otomatis 24/7 dari nomor bisnis
            Anda.
          </p>

          <Button variant="success" className="w-full">
            <Plug className="h-4 w-4" /> Hubungkan WhatsApp
          </Button>
        </Card>

        {/* Website Widget */}
        <Card accentColor="blue" hover className="relative flex flex-col overflow-hidden p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue ring-1 ring-inset ring-accent-blue/25 dark:bg-accent-blue/15 dark:text-accent-blue-light">
              <Globe className="h-6 w-6" />
            </div>
            <Badge variant="warning" dot>Belum Terpasang</Badge>
          </div>

          <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            Website Widget
          </h3>
          <p className="mb-4 mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Pasang satu baris kode di website Anda — pelanggan bisa langsung chat tanpa keluar dari
            halaman.
          </p>

          <div className="relative mb-4 rounded-xl border border-neutral-700 bg-neutral-950 p-3.5 pr-11 font-mono text-[10px] text-accent-blue-light">
            <code className="break-all leading-relaxed">{snippetCode}</code>
            <button
              onClick={handleCopyCode}
              className="absolute right-1.5 top-1.5 rounded-lg bg-white/10 p-1.5 text-neutral-300 transition-all hover:bg-white/20 hover:text-white"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-accent-green-light" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            <Code className="h-4 w-4" /> Ambil Kode Widget
          </Button>
        </Card>

        {/* Telegram */}
        <Card hover className="relative flex flex-col overflow-hidden p-6 opacity-90">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-teal/10 text-accent-teal ring-1 ring-inset ring-accent-teal/25 dark:bg-accent-teal/15 dark:text-accent-teal-light">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M21.94 4.35 18.9 19.1c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.34-4.79L18.36 6.6c.38-.34-.08-.53-.59-.19L6.93 13.04l-4.64-1.45c-1.01-.31-1.02-1.01.21-1.49l18.1-6.98c.84-.31 1.57.2 1.34 1.23Z" />
              </svg>
            </div>
            <Badge variant="neutral">Segera Hadir</Badge>
          </div>

          <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            Telegram Bot
          </h3>
          <p className="mb-5 mt-1 flex-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {CHANNEL_META["coming-soon"].hint} — nantinya bot akan aktif di channel dan grup Telegram
            Anda.
          </p>

          <Button variant="secondary" disabled className="w-full">
            <Plug className="h-4 w-4" /> Menunggu Rilis
          </Button>
        </Card>

        {/* Discord */}
        <Card hover className="relative flex flex-col overflow-hidden p-6 opacity-90">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-violet/10 text-accent-violet ring-1 ring-inset ring-accent-violet/25 dark:bg-accent-violet/15 dark:text-accent-violet-light">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06c0 .02.01.04.03.05a19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08 0c.12.1.25.2.38.3a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.87.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.22 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6.02-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.22 0 2.18 1.1 2.16 2.42 0 1.34-.94 2.42-2.16 2.42Z" />
              </svg>
            </div>
            <Badge variant="neutral">Segera Hadir</Badge>
          </div>

          <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            Discord
          </h3>
          <p className="mb-5 mt-1 flex-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {CHANNEL_META["coming-soon"].hint} — jawab pertanyaan komunitas otomatis di server
            Discord Anda.
          </p>

          <Button variant="secondary" disabled className="w-full">
            <Plug className="h-4 w-4" /> Menunggu Rilis
          </Button>
        </Card>
      </div>

      {/* Link dokumentasi */}
      <div className="py-3 text-center">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-xs font-semibold text-accent-blue transition-all hover:gap-3 hover:underline dark:text-accent-blue-light"
        >
          Butuh bantuan integrasi? Lihat Dokumentasi Lengkap <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ── Modal integrasi widget ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in bg-neutral-950/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl space-y-5 overflow-hidden rounded-3xl border border-border-subtle bg-white p-6 shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 dark:border-neutral-800">
              <h3 className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
                  <Globe className="h-4.5 w-4.5" />
                </span>
                Integrasi Widget Live Chat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Cara Pemasangan:</p>
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Salin snippet kode HTML di bawah ini, kemudian tempelkan tepat sebelum tag penutup{" "}
                <code className="font-mono text-accent-blue dark:text-accent-blue-light">&lt;/body&gt;</code> di
                dalam file HTML utama website Anda.
              </p>
            </div>

            <div className="relative flex min-h-[60px] items-center rounded-xl border border-neutral-700 bg-neutral-950 p-4 pr-14 font-mono text-[11px]">
              <pre className="w-full whitespace-pre-wrap break-all text-left leading-normal text-neutral-300">
                <code>{snippetCode}</code>
              </pre>
              <button
                onClick={handleCopyCode}
                title="Salin Kode"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-neutral-700 bg-white/5 p-2 text-neutral-300 transition-all hover:bg-white/10 hover:text-white"
              >
                {isCopied ? <Check className="h-4 w-4 text-accent-green-light" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-border-subtle pt-4 dark:border-neutral-800">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Kembali
              </Button>
              <Button
                onClick={handleCopyCode}
                className={cn(isCopied && "bg-accent-green hover:bg-accent-green-dark")}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Salin Kode
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
