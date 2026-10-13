import { useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button, Input } from "../components/ui";

/* ─────────────────────────────────────────────────────────────
 * Tipe data & dummy state awal
 * ───────────────────────────────────────────────────────────── */
interface ApiKeyItem {
  id: number;
  name: string;
  fullKey: string;
  createdAt: string;
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: 1,
    name: "Integrasi Web Toko",
    fullKey: "jb_live_9a8b7c6d5e4f3g2h1i0j",
    createdAt: "12 Sep 2026",
  },
  {
    id: 2,
    name: "CS Mobile App",
    fullKey: "jb_live_5c1d8e2f4a7b9g0h3i6j",
    createdAt: "28 Des 2025",
  },
];

const BASE_URL = "https://api.jagobot.id/v1/";

/* Format tampilan API Key: 8 karakter pertama, sensor, 4 karakter terakhir */
const maskKey = (fullKey: string) =>
  `${fullKey.slice(0, 8)}********${fullKey.slice(-4)}`;

/* Charset untuk key baru (mimpi contoh: jb_live_9a8b7c6d5e4f3g2h1i0j) */
const KEY_CHARSET = "0123456789abcdefghjk";

const generateNewKey = () => {
  let suffix = "";
  for (let i = 0; i < 20; i++) {
    suffix += KEY_CHARSET[Math.floor(Math.random() * KEY_CHARSET.length)];
  }
  return `jb_live_${suffix}`;
};

/* ─────────────────────────────────────────────────────────────
 * Hook copy to clipboard sederhana
 * ───────────────────────────────────────────────────────────── */
const useCopyToClipboard = (copyDelayMs = 2000) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback untuk browser lama / non-secure context
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedId(id);
    window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), copyDelayMs);
  };

  return { copiedId, copy };
};

/* ─────────────────────────────────────────────────────────────
 * Overlay modal dasar (dipakai Create & Delete)
 * ───────────────────────────────────────────────────────────── */
interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const ModalShell = ({ open, onClose, children, maxWidth = "max-w-md" }: ModalShellProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full overflow-hidden rounded-xl bg-white shadow-pop dark:bg-neutral-900", maxWidth)}
      >
        {children}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
 * Halaman utama: Manajemen API
 * ───────────────────────────────────────────────────────────── */
export const ApiManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);

  /* Modal Create (2 tahap) */
  const [createStep, setCreateStep] = useState<"form" | "result" | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  /* Modal Delete */
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { copiedId, copy } = useCopyToClipboard();

  /* ── Aksi Create ──────────────────────────────────────────── */
  const handleGenerate = () => {
    const name = newKeyName.trim();
    if (!name) return;

    const newKey: ApiKeyItem = {
      id: Date.now(),
      name,
      fullKey: generateNewKey(),
      createdAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setGeneratedKey(newKey.fullKey);
    setApiKeys((prev) => [newKey, ...prev]);
    setCreateStep("result"); // Tahap 2: tampilkan key utuh
  };

  const closeCreateModal = () => {
    setCreateStep(null);
    setNewKeyName("");
    setGeneratedKey(null);
  };

  /* ── Aksi Delete (R)ead + Delete dari CRD ────────────────── */
  const handleConfirmDelete = () => {
    if (!keyToDelete) return;
    setIsDeleting(true);
    // Simulasi request ke server
    window.setTimeout(() => {
      setApiKeys((prev) => prev.filter((k) => k.id !== keyToDelete.id));
      setIsDeleting(false);
      setKeyToDelete(null);
    }, 400);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* ── Header Halaman ─────────────────────────────────────── */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-blue dark:text-accent-blue-light">
            JagoBot
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Manajemen API
          </h1>
          <p className="mt-1 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Kelola kunci API untuk mengintegrasikan JagoBot dengan platform atau aplikasi
            eksternal Anda.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-green-dark dark:text-accent-green-light">
          <ShieldCheck className="h-4 w-4" />
          Semua kunci tersimpan terenkripsi
        </span>
      </header>

      {/* ── Card 1: Daftar API Key ─────────────────────────────── */}
      <section
        aria-label="Kunci API aktif"
        className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-colors dark:bg-neutral-900/70 dark:border-neutral-700/60"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue ring-1 ring-inset ring-accent-blue/20 dark:bg-accent-blue/15 dark:text-accent-blue-light dark:ring-accent-blue/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Kunci API Aktif
            </h2>
          </div>

          <Button size="sm" onClick={() => setCreateStep("form")}>
            <Plus className="h-4 w-4" />
            Generate API Key Baru
          </Button>
        </div>

        {/* Tabel responsif */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:border-neutral-800">
                <th scope="col" className="px-3 py-3">Nama Kunci</th>
                <th scope="col" className="px-3 py-3">API Key</th>
                <th scope="col" className="px-3 py-3">Dibuat Pada</th>
                <th scope="col" className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-subtle transition-colors last:border-0 hover:bg-neutral-50/70 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded-md bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
                        {maskKey(item.fullKey)}
                      </code>
                      <button
                        type="button"
                        onClick={() => copy(item.fullKey, String(item.id))}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent-blue focus-ring dark:hover:bg-neutral-800 dark:hover:text-accent-blue-light"
                        aria-label={`Copy API key ${item.name}`}
                      >
                        {copiedId === String(item.id) ? (
                          <Check className="h-4 w-4 text-accent-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-neutral-500 dark:text-neutral-400">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setKeyToDelete(item)}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-accent-pink/10 hover:text-accent-pink focus-ring dark:hover:bg-accent-pink/15"
                      aria-label={`Hapus API key ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                      Belum ada API key aktif
                    </p>
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                      Klik "Generate API Key Baru" untuk membuat kunci pertama Anda.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Card 2: Referensi Integrasi ────────────────────────── */}
      <section
        aria-label="Informasi integrasi"
        className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-colors dark:bg-neutral-900/70 dark:border-neutral-700/60"
      >
        <h2 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
          Informasi Integrasi
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Gunakan API Key Anda sebagai <strong className="font-semibold text-neutral-700 dark:text-neutral-200">Bearer Token</strong>{" "}
          saat melakukan request ke server JagoBot.
        </p>

        {/* Blok Base URL */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-neutral-700/60 dark:bg-neutral-800/50">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
              Base URL
            </p>
            <code className="mt-1 block text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {BASE_URL}
            </code>
          </div>
          <button
            type="button"
            onClick={() => copy(BASE_URL, "base-url")}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:text-accent-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {copiedId === "base-url" ? (
              <Check className="h-3.5 w-3.5 text-accent-green" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedId === "base-url" ? "Tersalin" : "Copy"}
          </button>
        </div>

        <a
          href="https://api.jagobot.id/v1/docs"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-accent-blue/40 hover:text-accent-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:text-accent-blue-light"
        >
          <ExternalLink className="h-4 w-4" />
          Baca Dokumentasi API Lengkap
        </a>
      </section>

      {/* ── Modal Create: Tahap 1 — Form nama kunci ───────────── */}
      <ModalShell open={createStep === "form"} onClose={closeCreateModal}>
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Generate API Key Baru
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Beri nama kunci agar mudah dikenali, misal "Integrasi Web Toko".
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateModal}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Tutup"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form
          className="px-6 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
        >
          <label
            htmlFor="api-key-name"
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400"
          >
            Nama Kunci
          </label>
          <div className="mt-1.5">
            <Input
              id="api-key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Integrasi Web Toko"
              autoFocus
              maxLength={50}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={closeCreateModal}>
              Batal
            </Button>
            <Button type="submit" disabled={!newKeyName.trim()}>
              <Plus className="h-4 w-4" />
              Generate Kunci
            </Button>
          </div>
        </form>
      </ModalShell>

      {/* ── Modal Create: Tahap 2 — Key utuh ──────────────────── */}
      <ModalShell open={createStep === "result"} onClose={closeCreateModal}>
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green dark:bg-accent-green/15">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                API Key Berhasil Dibuat
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Kunci "{newKeyName}" aktif dan siap digunakan.
              </p>
            </div>
          </div>
        </div>

        {generatedKey && (
          <div className="px-6">
            {/* Banner peringatan */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs font-medium leading-relaxed text-amber-800 dark:text-amber-200">
                Silakan salin kunci ini sekarang. Untuk alasan keamanan, Anda tidak akan bisa
                melihat kunci ini secara utuh lagi setelah menutup jendela ini.
              </p>
            </div>

            {/* Key utuh + tombol copy besar */}
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
              <code className="block break-all text-center font-display text-sm font-bold tracking-wide text-neutral-900 dark:text-neutral-50">
                {generatedKey}
              </code>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={() => copy(generatedKey, "generated")}
              >
                {copiedId === "generated" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedId === "generated" ? "Tersalin ke Clipboard" : "Copy API Key"}
              </Button>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-5">
          <Button variant="secondary" className="w-full" onClick={closeCreateModal}>
            Saya Sudah Menyalin, Tutup
          </Button>
        </div>
      </ModalShell>

      {/* ── Modal Delete: Konfirmasi cabut kunci ──────────────── */}
      <ModalShell
        open={keyToDelete !== null}
        onClose={() => setKeyToDelete(null)}
      >
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink dark:bg-accent-pink/15">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Cabut Kunci API
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Apakah Anda yakin ingin mencabut kunci{" "}
                <strong className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {keyToDelete?.name}
                </strong>
                ? Aplikasi yang menggunakan API Key ini akan langsung terputus dan tidak bisa
                mengirim pesan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-6 pb-6">
          <Button
            variant="secondary"
            onClick={() => setKeyToDelete(null)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Mencabut..." : "Ya, Cabut Kunci"}
          </Button>
        </div>
      </ModalShell>
    </main>
  );
};
