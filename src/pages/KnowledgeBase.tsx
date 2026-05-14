import { Upload, FileText, Trash2, Pencil, X, Info, Loader2, Database, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import api, { getKnowledgeBaseList } from "../lib/api";
import { cn } from "../lib/utils";
import { FloatingKnowledgePanel } from "../components/FloatingKnowledgePanel";

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

      // ✅ FIX: Ambil botId langsung dari activeBotId yang dikelola DashboardLayout
      const storedActiveBotId = localStorage.getItem("activeBotId");

      console.log("═══════════════════════════════════════════════════════");
      console.log("📄 [KnowledgeBase] Loading knowledge base");
      console.log("activeBotId from localStorage:", storedActiveBotId);

      if (storedActiveBotId) {
        const numericBotId = Number(storedActiveBotId);
        console.log("🔵 Numeric Bot ID:", numericBotId);
        console.log("📤 Fetching knowledge base list for botId:", numericBotId);
        
        setActiveBotId(numericBotId);
        
        // ✅ Panggil API dengan ID yang sudah pasti angka
        const fileRes = await getKnowledgeBaseList(numericBotId);
        console.log("📥 API Response:", fileRes);
        console.log("📂 Files count:", fileRes.data.data?.length || 0);
        
        setFiles(fileRes.data.data || []);
      } else {
        console.warn("⚠️ activeBotId tidak ditemukan di localStorage. Pastikan bot sudah dipilih.");
        setFiles([]); // Pastikan list kosong jika bot tidak ditemukan
      }
      console.log("═══════════════════════════════════════════════════════\n");
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
    !( file.nama_sumber || file.name || "" ).match(/\.(pdf|docx|txt)$/i);

  const handleEditSuccess = (updatedFile: any) => {
    setFiles(files.map((f) => (f.id === updatedFile.id ? { ...f, ...updatedFile } : f)));
    setEditingFile(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 pb-10">
      {/* Header Info Tip */}
      <div className="bg-[#1800ad]/5 border border-[#1800ad]/10 p-4 rounded-2xl flex gap-3">
        <div className="p-2 bg-[#1800ad]/10 rounded-lg h-fit">
            <Info className="w-5 h-5 text-[#1800ad] shrink-0" />
        </div>
        <p className="text-xs text-brand-blue dark:text-white leading-relaxed">
          <strong className="font-bold uppercase tracking-tighter mr-1">💡 Tips:</strong> Semakin detail informasi yang Anda berikan, semakin pintar bot Anda menjawab pertanyaan pelanggan. Unggah katalog produk atau tulis FAQ toko Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: File List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Basis Pengetahuan Bot
                </h3>
              </div>
              <button 
                onClick={handleOpenPanel}
                className="bg-gradient-to-r from-[#1800ad] to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#1800ad]/30"
              >
                <Upload className="w-4 h-4" /> Tambah
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {isLoading && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#1800ad] animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Memuat Basis Pengetahuan...
                  </p>
                </div>
              ) : files.length > 0 ? (
                files.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={file.id || idx} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-slate-900/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-[#1800ad]/20 rounded-xl group-hover:bg-[#1800ad]/30 transition-colors">
                        <FileText className="w-5 h-5 text-[#1800ad]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate max-w-[300px] md:max-w-md">
                          {file.nama_sumber || file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString('id-ID') : 'BARU'}
                          </span>
                          <span className={cn(
                            "text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter shrink-0",
                            file.status === 'ready' 
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          )}>
                            {file.status === 'ready' ? '✓ TERSINKRON' : '⏳ DIPROSES'}
                          </span>
                          {isManualFile(file) && (
                            <span className="text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter shrink-0 bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              ✏️ MANUAL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isManualFile(file) && (
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Edit isi konten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(file.id)} 
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <Database className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    📭 Belum ada basis pengetahuan terdaftar.
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2">Mulai dengan mengklik tombol "Tambah" di atas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Guide / Info */}
        <div className="space-y-6">
          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 uppercase tracking-tight">📚 Kelola Pengetahuan</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gunakan fitur ini untuk melatih bot Anda dengan data spesifik toko Anda. Bot akan memberikan jawaban berdasarkan informasi yang Anda berikan di sini. Klik tombol <strong className="text-white">"Tambah"</strong> untuk mulai mengunggah dokumen atau menulis informasi manual.
            </p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2rem]">
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">✅ Panduan</h4>
            <ul className="text-[10px] text-slate-400 space-y-2.5 list-disc ml-4 font-medium">
              <li>Mendukung file <strong>PDF, DOCX, TXT</strong></li>
              <li>Ukuran file maksimal <strong>10MB</strong> per unggahan</li>
              <li>Pastikan teks dalam dokumen dapat dibaca (bukan gambar)</li>
              <li>Tulis informasi sejelas mungkin untuk hasil terbaik</li>
              <li>Data otomatis disimpan ke database Anda</li>
            </ul>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-[2rem]">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">📊 Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Total Dokumen:</span>
                <span className="text-white font-bold">{files.length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Tersinkron:</span>
                <span className="text-emerald-400 font-bold">{files.filter(f => f.status === 'ready').length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Diproses:</span>
                <span className="text-blue-400 font-bold">{files.filter(f => f.status !== 'ready').length}</span>
              </div>
            </div>
          </div>
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
        console.log("🔍 Fetching KB content for ID:", file.id);
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
          status: "ready"
        });
      } else {
        alert("❌ " + (response.data.message || "Gagal memperbarui konten."));
      }
    } catch (error: any) {
      console.error("❌ Gagal menyimpan:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Gagal memperbarui konten.";
      alert("❌ " + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-3xl flex flex-col border border-white/10 overflow-hidden max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#1800ad] to-blue-600">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Edit Konten Manual</h3>
              <p className="text-xs text-blue-100">Perbarui judul dan isi informasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
          {isLoadingContent ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#1800ad] animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat konten...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul Informasi"
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-slate-800 dark:text-white text-sm font-bold placeholder:text-slate-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Isi Konten</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan detail informasi..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-slate-700 dark:text-white text-sm min-h-[260px] resize-none font-medium placeholder:text-slate-400 transition-all"
                />
              </div>
            </>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Batal</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#1800ad] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#1800ad]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Simpan & Perbarui
          </button>
        </div>
      </motion.div>
    </div>
  );
};