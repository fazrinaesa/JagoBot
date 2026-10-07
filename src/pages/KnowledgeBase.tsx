import { Upload, FileText, Trash2, Pencil, X, Database, CheckCircle2, Clock, BookOpen, CloudUpload, ArrowRight, PenLine } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import api, { getKnowledgeBaseList } from "../lib/api";
import { cn } from "../lib/utils";
import { FloatingKnowledgePanel } from "../components/FloatingKnowledgePanel";
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Textarea } from "../components/ui";

export const KnowledgeBase = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBotId, setActiveBotId] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [editingFile, setEditingFile] = useState<any | null>(null);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      // Ambil botId langsung dari activeBotId yang dikelola DashboardLayout
      const storedActiveBotId = localStorage.getItem("activeBotId");

      if (storedActiveBotId) {
        const numericBotId = Number(storedActiveBotId);

        setActiveBotId(numericBotId);

        const fileRes = await getKnowledgeBaseList(numericBotId);
        setFiles(fileRes.data.data || []);
      } else {
        console.warn("⚠️ activeBotId tidak ditemukan di localStorage. Pastikan bot sudah dipilih.");
        setFiles([]); // Pastikan list kosong jika bot tidak ditemukan
      }
    } catch (error) {
      console.error("❌ Gagal memuat data:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (fileId: number) => {
    if (window.confirm("🗑️ Apakah Anda yakin ingin menghapus dokumen ini?")) {
      try {
        await api.delete(`/knowledge/${fileId}`);
        setFiles(files.filter((f) => f.id !== fileId));
        alert("✅ Dokumen berhasil dihapus!");
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("❌ Gagal menghapus file.");
      }
    }
  };

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
    setIsPanelMinimized(false);
  };

  // Hanya file manual (bukan PDF/DOCX/TXT) yang bisa diedit
  const isManualFile = (file: any) =>
    !(file.nama_sumber || file.name || "").match(/\.(pdf|docx|txt)$/i);

  const handleEditSuccess = (updatedFile: any) => {
    setFiles(files.map((f) => (f.id === updatedFile.id ? { ...f, ...updatedFile } : f)));
    setEditingFile(null);
  };

  const readyCount = files.filter((f) => f.status === "ready").length;
  const processingCount = files.length - readyCount;

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      <PageHeader
        title="Knowledge Base"
        description="Latih bot Anda dengan dokumen dan informasi spesifik toko."
        actions={
          <Button onClick={handleOpenPanel}>
            <Upload className="h-4 w-4" /> Tambah Pengetahuan
          </Button>
        }
      />

      {/* ── Area tambah dokumen: dua jalur yang intuitif ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={handleOpenPanel}
          className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-accent-blue/30 bg-gradient-to-br from-accent-blue/5 to-transparent p-6 text-left transition-all duration-300 hover:border-accent-blue/60 hover:shadow-hover-blue focus-ring dark:border-accent-blue/30 dark:from-accent-blue/10 dark:to-transparent"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-blue/15 opacity-70 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-accent-blue shadow-soft ring-1 ring-inset ring-accent-blue/20 transition-transform duration-300 group-hover:scale-105 dark:bg-neutral-900 dark:text-accent-blue-light dark:ring-accent-blue/30">
              <CloudUpload className="h-5.5 w-5.5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Unggah Dokumen</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Tarik &amp; lepas atau klik untuk memilih file — PDF, DOCX, TXT hingga 10MB.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-blue dark:text-accent-blue-light">
              Mulai Upload
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </button>

        <button
          onClick={handleOpenPanel}
          className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-accent-violet/30 bg-gradient-to-br from-accent-violet/5 to-transparent p-6 text-left transition-all duration-300 hover:border-accent-violet/60 hover:shadow-hover-violet focus-ring dark:border-accent-violet/30 dark:from-accent-violet/10 dark:to-transparent"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-violet/15 opacity-70 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-accent-violet shadow-soft ring-1 ring-inset ring-accent-violet/20 transition-transform duration-300 group-hover:scale-105 dark:bg-neutral-900 dark:text-accent-violet-light dark:ring-accent-violet/30">
              <PenLine className="h-5.5 w-5.5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Tulis Informasi Manual</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Ketik FAQ, jam buka, atau info produk langsung — tanpa perlu file.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-violet dark:text-accent-violet-light">
              Mulai Menulis
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KOLOM KIRI: Daftar file */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="flex min-h-[420px] flex-col p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                    Basis Pengetahuan Bot
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {files.length} dokumen terdaftar
                  </p>
                </div>
              </div>
            </div>

            {isLoading && files.length === 0 ? (
              <LoadingState label="Memuat Basis Pengetahuan..." />
            ) : files.length > 0 ? (
              <div className="custom-scrollbar max-h-[480px] flex-1 space-y-2.5 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={file.id || idx}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 shadow-soft transition-all hover:shadow-hover-blue dark:border-neutral-800 dark:bg-neutral-900/60"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet transition-colors group-hover:bg-accent-violet/20 dark:bg-accent-violet/15 dark:text-accent-violet-light">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                          {file.nama_sumber || file.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium text-neutral-400">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString("id-ID") : "Baru"}
                          </span>
                          {file.status === "ready" ? (
                            <Badge variant="success">
                              <CheckCircle2 className="h-3 w-3" /> Tersinkron
                            </Badge>
                          ) : (
                            <Badge variant="info">
                              <Clock className="h-3 w-3" /> Diproses
                            </Badge>
                          )}
                          {isManualFile(file) && (
                            <Badge variant="violet">
                              <Pencil className="h-3 w-3" /> Manual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isManualFile(file) && (
                        <button
                          onClick={() => setEditingFile(file)}
                          className="rounded-lg p-2 text-neutral-400 opacity-0 transition-all hover:bg-accent-blue/10 hover:text-accent-blue focus-ring group-hover:opacity-100 dark:hover:text-accent-blue-light"
                          title="Edit isi konten"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="rounded-lg p-2 text-neutral-400 opacity-0 transition-all hover:bg-accent-pink/10 hover:text-accent-pink focus-ring group-hover:opacity-100"
                        title="Hapus dokumen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Database}
                title="Belum ada basis pengetahuan terdaftar"
                description='Mulai dengan mengklik tombol "Tambah Pengetahuan" di atas.'
                className="py-12"
              />
            )}
          </Card>
        </div>

        {/* KOLOM KANAN: Panduan & status */}
        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-teal/10 text-accent-teal dark:bg-accent-teal/15 dark:text-accent-teal-light">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                Kelola Pengetahuan
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Gunakan fitur ini untuk melatih bot Anda dengan data spesifik toko Anda. Bot akan
              memberikan jawaban berdasarkan informasi yang Anda berikan di sini. Klik tombol{" "}
              <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
                "Tambah Pengetahuan"
              </strong>{" "}
              untuk mulai mengunggah dokumen atau menulis informasi manual.
            </p>
          </Card>

          <Card accentColor="green" className="p-5">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent-green-dark dark:text-accent-green-light">
              Panduan
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <li>Mendukung file <strong className="text-neutral-700 dark:text-neutral-200">PDF, DOCX, TXT</strong></li>
              <li>Ukuran file maksimal <strong className="text-neutral-700 dark:text-neutral-200">10MB</strong> per unggahan</li>
              <li>Pastikan teks dalam dokumen dapat dibaca (bukan gambar)</li>
              <li>Tulis informasi sejelas mungkin untuk hasil terbaik</li>
              <li>Data otomatis disimpan ke database Anda</li>
            </ul>
          </Card>

          {/* Status Dokumen — indikator warna fresh */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Status Dokumen
              </h4>
              <Badge variant="neutral">{files.length} total</Badge>
            </div>

            {/* Bar proporsi tersinkron vs diproses */}
            <div className="mb-5 flex h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              {files.length > 0 && (
                <>
                  <div
                    className="h-full bg-accent-teal transition-all duration-500"
                    style={{ width: `${(readyCount / files.length) * 100}%` }}
                  />
                  <div
                    className="h-full bg-accent-orange transition-all duration-500"
                    style={{ width: `${(processingCount / files.length) * 100}%` }}
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue ring-1 ring-inset ring-accent-blue/20 dark:bg-accent-blue/15 dark:text-accent-blue-light dark:ring-accent-blue/30">
                  <Database className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Total Dokumen</p>
                  <p className="text-[10px] text-neutral-400">Seluruh sumber pengetahuan</p>
                </div>
                <span className="font-display text-lg font-bold tabular-nums text-neutral-900 dark:text-white">
                  {files.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-teal/10 text-accent-teal ring-1 ring-inset ring-accent-teal/20 dark:bg-accent-teal/15 dark:text-accent-teal-light dark:ring-accent-teal/30">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Tersinkron</p>
                  <p className="text-[10px] text-neutral-400">Siap menjawab pelanggan</p>
                </div>
                <span className="font-display text-lg font-bold tabular-nums text-accent-teal dark:text-accent-teal-light">
                  {readyCount}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-orange/10 text-accent-orange ring-1 ring-inset ring-accent-orange/20 dark:bg-accent-orange/15 dark:text-accent-orange-light dark:ring-accent-orange/30">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Diproses</p>
                  <p className="text-[10px] text-neutral-400">Sedang di-embedding</p>
                </div>
                <span className="font-display text-lg font-bold tabular-nums text-accent-orange dark:text-accent-orange-light">
                  {processingCount}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Edit Konten Manual */}
      {editingFile && (
        <EditManualModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Floating Knowledge Panel */}
      <FloatingKnowledgePanel
        isOpen={isPanelOpen}
        isMinimized={isPanelMinimized}
        onClose={() => setIsPanelOpen(false)}
        onMinimize={() => setIsPanelMinimized(true)}
        onMaximize={() => setIsPanelMinimized(false)}
        activeBotId={activeBotId}
        onUploadSuccess={fetchInitialData}
        isLoading={isLoading}
      />
    </div>
  );
};

// ─── Komponen Modal Edit Konten Manual ───────────────────────────────────────

interface EditManualModalProps {
  file: any;
  onClose: () => void;
  onSuccess: (updatedFile: any) => void;
}

const EditManualModal = ({ file, onClose, onSuccess }: EditManualModalProps) => {
  const [title, setTitle] = useState(file.nama_sumber || file.name || "");
  const [content, setContent] = useState(file.isi_teks || file.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoadingContent(true);
        const res = await api.get(`/knowledge/${file.id}`);
        const fetchedData = res.data.data;
        setTitle(fetchedData?.nama_sumber || file.nama_sumber || "");
        setContent(fetchedData?.isi_teks || file.isi_teks || "");
      } catch (error: any) {
        console.error("❌ Gagal memuat konten:", error.message);
        setTitle(file.nama_sumber || file.name || "");
        setContent(file.isi_teks || file.content || "");
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, [file.id, file.nama_sumber, file.isi_teks]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("⚠️ Judul dan konten tidak boleh kosong.");
      return;
    }
    try {
      setIsSaving(true);
      const response = await api.put(`/knowledge/${file.id}`, {
        title,
        content,
      });
      if (response.data.success) {
        alert("✅ Konten berhasil diperbarui!");
        onSuccess({
          ...file,
          nama_sumber: title,
          isi_teks: content,
          status: "ready",
        });
      } else {
        alert("❌ " + (response.data.message || "Gagal memperbarui konten."));
      }
    } catch (error: any) {
      console.error("❌ Gagal menyimpan:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui konten.";
      alert("❌ " + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-neutral-950/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-6 pb-4 pt-5 dark:border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                Edit Konten Manual
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Perbarui judul dan isi informasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
          {isLoadingContent ? (
            <LoadingState label="Memuat konten..." />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Judul</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul Informasi"
                  className="font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Isi Konten</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan detail informasi..."
                  className="min-h-[240px] font-medium"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border-subtle bg-neutral-50/60 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/30">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <X className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Simpan & Perbarui
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
