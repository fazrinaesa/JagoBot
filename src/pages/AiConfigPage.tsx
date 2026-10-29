import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Zap,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Server,
} from "lucide-react";
import {
  AiProvider,
  adminGetAiProviders,
  adminCreateAiProvider,
  adminUpdateAiProvider,
  adminDeleteAiProvider,
  adminReorderAiProviders,
  adminTestAiProvider,
} from "../lib/api";
import { Badge, Button, Card, EmptyState, FieldLabel, Input, LoadingState, PageHeader, Select, Toggle } from "../components/ui";

/**
 * Halaman Konfigurasi AI — hanya untuk SUPER_ADMIN.
 * Mengelola provider model (Base URL, API Key, model) + urutan rolling.
 */

const emptyForm = {
  label: "",
  provider: "gemini" as "gemini" | "openai-compatible",
  baseUrl: "",
  apiKey: "",
  model: "",
  maxTokens: "",
  temperature: "",
};

export const AiConfigPage: React.FC = () => {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [testingId, setTestingId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    try {
      const res = await adminGetAiProviders();
      setProviders(res.data.data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat konfigurasi AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !showForm && saving === false && testingId === null) void load();
    }, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && !showForm && saving === false && testingId === null) void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [showForm, saving, testingId]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: any = {
        label: form.label,
        provider: form.provider,
        model: form.model,
        ...(form.provider === "openai-compatible" ? { baseUrl: form.baseUrl } : {}),
        ...(form.maxTokens ? { maxTokens: Number(form.maxTokens) } : {}),
        ...(form.temperature !== "" ? { temperature: Number(form.temperature) } : {}),
      };

      if (editingId) {
        // Key hanya dikirim bila diisi (agar tidak menimpa dengan kosong).
        if (form.apiKey) payload.apiKey = form.apiKey;
        await adminUpdateAiProvider(editingId, payload);
        setNotice("Provider berhasil diperbarui.");
      } else {
        if (!form.apiKey) { setError("API Key wajib diisi."); setSaving(false); return; }
        payload.apiKey = form.apiKey;
        await adminCreateAiProvider(payload);
        setNotice("Provider berhasil ditambahkan.");
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal menyimpan provider.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: AiProvider) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      label: p.label,
      provider: p.provider,
      baseUrl: p.baseUrl || "",
      apiKey: "",
      model: p.model,
      maxTokens: p.maxTokens ? String(p.maxTokens) : "",
      temperature: p.temperature !== null && p.temperature !== undefined ? String(p.temperature) : "",
    });
  };

  const remove = async (id: number) => {
    if (!confirm("Hapus provider ini?")) return;
    try {
      await adminDeleteAiProvider(id);
      setNotice("Provider dihapus.");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal menghapus provider.");
    }
  };

  const toggleActive = async (p: AiProvider) => {
    try {
      await adminUpdateAiProvider(p.id, { isActive: !p.isActive });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal mengubah status provider.");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...providers];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setProviders(next); // optimistis
    try {
      await adminReorderAiProviders(next.map((p) => p.id));
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal menyimpan urutan.");
      await load();
    }
  };

  const test = async (id: number) => {
    setTestingId(id);
    setNotice(null);
    setError(null);
    try {
      const res = await adminTestAiProvider(id);
      if (res.data.ok) setNotice(res.data.message);
      else setError(res.data.message);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal menguji provider.");
    } finally {
      setTestingId(null);
    }
  };

  if (loading) return <LoadingState label="Memuat konfigurasi AI..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurasi AI"
        description="Kelola provider model, API Key, dan urutan rolling saat model habis."
        actions={
          <Button onClick={() => { resetForm(); setShowForm((v) => !v); }}>
            <Plus className="mr-1.5 h-4 w-4" /> {showForm ? "Tutup Form" : "Tambah Provider"}
          </Button>
        }
      />

      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
        Status provider diperbarui otomatis tiap 5 detik{lastUpdated ? ` · terakhir ${lastUpdated.toLocaleTimeString("id-ID")}` : ""}
      </p>

      {/* Notifikasi */}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Info cara kerja rolling */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent-blue" />
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            <p className="font-medium text-neutral-800 dark:text-neutral-100">Cara kerja rolling model</p>
            <p className="mt-1">
              Provider dicoba <strong>berurutan dari atas ke bawah</strong>. Bila satu model habis
              (kuota/rate limit), error, atau tidak merespons, sistem otomatis beralih ke model
              berikutnya. Jika daftar ini kosong, sistem memakai konfigurasi default dari file <code>.env</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* Form tambah/edit */}
      {showForm && (
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {editingId ? "Ubah Provider" : "Tambah Provider Baru"}
          </h3>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Nama Provider</FieldLabel>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="mis. Gemini Utama"
                required
              />
            </div>

            <div>
              <FieldLabel>Jenis Provider</FieldLabel>
              <Select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
              >
                <option value="gemini">Gemini (Google)</option>
                <option value="openai-compatible">OpenAI-compatible (9router, OpenRouter, dll)</option>
              </Select>
            </div>

            {form.provider === "openai-compatible" && (
              <div className="sm:col-span-2">
                <FieldLabel>Base URL</FieldLabel>
                <Input
                  value={form.baseUrl}
                  onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                  placeholder="https://9router.jagoai.dev/v1"
                  required
                />
              </div>
            )}

            <div>
              <FieldLabel>Nama Model</FieldLabel>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder={form.provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini"}
                required
              />
            </div>

            <div>
              <FieldLabel>
                API Key {editingId && <span className="text-neutral-400">(biarkan kosong bila tidak diubah)</span>}
              </FieldLabel>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={editingId ? "•••••••• (tidak diubah)" : "Masukkan API key"}
                required={!editingId}
                autoComplete="new-password"
              />
            </div>

            <div>
              <FieldLabel>Maks. Token <span className="text-neutral-400">(opsional)</span></FieldLabel>
              <Input
                type="number"
                value={form.maxTokens}
                onChange={(e) => setForm({ ...form, maxTokens: e.target.value })}
                placeholder="mis. 1024"
              />
            </div>

            <div>
              <FieldLabel>Temperature <span className="text-neutral-400">(opsional)</span></FieldLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                placeholder="mis. 0.4"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Provider"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Daftar provider */}
      {providers.length === 0 ? (
        <EmptyState
          icon={Server}
          title="Belum ada provider AI"
          description="Tambahkan provider untuk mengatur model AI chatbot. Selama daftar kosong, sistem memakai konfigurasi .env."
        />
      ) : (
        <div className="space-y-3">
          {providers.map((p, i) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {/* Urutan rolling */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-0.5 text-neutral-400 transition-colors hover:text-accent-blue disabled:opacity-30"
                      title="Naikkan prioritas"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === providers.length - 1}
                      className="rounded-md p-0.5 text-neutral-400 transition-colors hover:text-accent-blue disabled:opacity-30"
                      title="Turunkan prioritas"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{p.label}</span>
                      <Badge variant="neutral">{p.provider === "gemini" ? "Gemini" : "OpenAI-compat"}</Badge>
                      {p.lastStatus === "ok" && <Badge variant="success" dot>Terhubung</Badge>}
                      {p.lastStatus === "error" && <Badge variant="danger" dot>Bermasalah</Badge>}
                      {!p.isActive && <Badge variant="warning">Nonaktif</Badge>}
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <p>Model: <span className="font-mono">{p.model}</span></p>
                      {p.baseUrl && <p className="truncate">Base URL: <span className="font-mono">{p.baseUrl}</span></p>}
                      <p className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> API Key: <span className="font-mono">{p.apiKeyMasked || "—"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Toggle checked={p.isActive} onChange={() => toggleActive(p)} />
                  <Button size="sm" variant="secondary" onClick={() => test(p.id)} disabled={testingId === p.id}>
                    <Zap className="mr-1 h-3.5 w-3.5" />
                    {testingId === p.id ? "Menguji..." : "Tes Koneksi"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => remove(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
