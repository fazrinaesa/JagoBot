import { Upload, FileText, Trash2, Plus, Info, CheckCircle2, Loader2, Edit3, X, Database } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import api, { getKnowledgeBaseList, getActiveBot } from "../lib/api";
import { cn } from "../lib/utils";

export const KnowledgeBase = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [manualText, setManualText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeBotId, setActiveBotId] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ✅ STATE TAMBAHAN UNTUK EDIT ---
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const botRes = await getActiveBot();
      const botId = botRes.data.data?.id || botRes.data.id;

      if (botId) {
        setActiveBotId(botId);
        const fileRes = await getKnowledgeBaseList(botId);
        setFiles(fileRes.data.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleEdit = (file: any) => {
    setIsEditing(true);
    setEditingId(file.id);
    setEditingTitle(file.nama_sumber);
    setManualText(file.isi_teks || "");
    setIsPanelOpen(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTitle("");
    setManualText("");
    setIsPanelOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBotId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", activeBotId.toString());

    try {
      setIsLoading(true);
      const response = await api.post("/knowledge/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data.success) {
        alert("Dokumen berhasil diunggah!");
        setIsPanelOpen(false);
        fetchInitialData();
      } else {
        alert("Gagal: " + (response.data.message || "Terjadi kesalahan"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah file: " + (error.response?.data?.message || "Internal Server Error"));
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = async () => {
    if (!editingTitle.trim() || !manualText.trim() || !activeBotId) {
      alert("Silakan masukkan judul dan teks informasi terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/knowledge/manual", {
        botId: activeBotId,
        title: editingTitle,
        content: manualText
      });

      if (response.data.success) {
        alert(isEditing ? "Informasi berhasil diperbarui!" : "Informasi berhasil disimpan dan bot sedang dilatih!");
        cancelEdit();
        fetchInitialData();
      }
    } catch (error: any) {
      console.error("Manual save error:", error);
      alert("Gagal menyimpan informasi manual.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      try {
        await api.delete(`/knowledge/${fileId}`);
        setFiles(files.filter((f) => f.id !== fileId));
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal menghapus file.");
      }
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 pb-10">
      {/* Header Info Tip (Look Awal) */}
      <div className="bg-[#1800ad]/5 border border-[#1800ad]/10 p-3 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-[#1800ad] shrink-0" />
        <p className="text-xs text-brand-blue dark:text-white leading-relaxed">
          <strong className="font-bold uppercase tracking-tighter mr-1">Tips:</strong> Semakin detail informasi yang Anda berikan, semakin pintar bot Anda menjawab pertanyaan pelanggan. Unggah katalog produk atau tulis FAQ toko Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Storage / File List (SPACIOUS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Penyimpanan Pengetahuan (Storage)</h3>
               </div>
               <button 
                onClick={() => setIsPanelOpen(true)}
                className="bg-[#1800ad] text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
               >
                 <Plus className="w-3.5 h-3.5" /> Tambah Data
               </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {isLoading && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#1800ad] animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Basis Pengetahuan...</p>
                </div>
              ) : files.length > 0 ? (
                files.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={file.id || idx} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-slate-900/10 hover:bg-white/[0.08] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#1800ad]/20 rounded-xl">
                        <FileText className="w-5 h-5 text-[#1800ad]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">{file.nama_sumber || file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString('id-ID') : 'BARU'}
                          </span>
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                            file.status === 'ready' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                          )}>
                            {file.status === 'ready' ? 'TERSINKRON' : 'DIPROSES'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.tipe_sumber === 'text' && (
                        <button onClick={() => handleEdit(file)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <Database className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Belum ada basis pengetahuan terdaftar.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Guide / Action Info (Look Awal) */}
        <div className="space-y-6">
          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 uppercase tracking-tight">Kelola Pengetahuan</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Gunakan fitur ini untuk melatih bot Anda dengan data spesifik toko Anda. Bot akan memberikan jawaban berdasarkan informasi yang Anda berikan di sini.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setIsPanelOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1800ad]/10 border border-[#1800ad]/20 hover:bg-[#1800ad]/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1800ad] rounded-lg">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">Unggah File</span>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>

              <button 
                onClick={() => { setIsEditing(false); setIsPanelOpen(true); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">Input Manual</span>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2rem]">
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Panduan</h4>
            <ul className="text-[10px] text-slate-400 space-y-2 list-disc ml-4 font-medium">
              <li>Mendukung file PDF, TXT, dan DOCX.</li>
              <li>Ukuran file maksimal adalah 10MB per unggahan.</li>
              <li>Pastikan teks di dalam dokumen dapat dibaca (bukan gambar).</li>
              <li>Tulis informasi manual sejelas mungkin untuk hasil terbaik.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Panel (Wide Modal) - Tetap Square & Luas */}
      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => cancelEdit()}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] flex flex-col border border-white/10 overflow-hidden max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-brand-blue">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    {isEditing ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      {isEditing ? "Perbarui Data" : "Tambah Pengetahuan Baru"}
                    </h3>
                  </div>
                </div>
                <button onClick={() => cancelEdit()} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Section 1: File Upload */}
                  {!isEditing && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#1800ad]/10 flex items-center justify-center text-[10px] font-bold text-[#1800ad]">1</div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">Unggah File</h4>
                      </div>
                      
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,.docx" />
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center hover:border-[#1800ad] hover:bg-blue-50/30 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/20"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-[#1800ad] transition-all">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-white">Klik atau Tarik File</p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PDF, DOCX, TXT</p>
                      </div>
                    </section>
                  )}

                  {/* Section 2: Manual Text */}
                  <section className={cn("space-y-4", isEditing ? "col-span-full" : "")}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1800ad]/10 flex items-center justify-center text-[10px] font-bold text-[#1800ad]">{isEditing ? "!" : "2"}</div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                        {isEditing ? "Edit Teks" : "Input Manual"}
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        placeholder="Judul Informasi"
                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-slate-800 dark:text-white text-sm font-bold placeholder:text-slate-400 transition-all"
                      />
                      <textarea
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="Tuliskan detail informasi toko Anda..."
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-slate-700 dark:text-white text-sm min-h-[200px] resize-none font-medium placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
                <button
                  onClick={() => cancelEdit()}
                  className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-[#1800ad] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#1800ad]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isEditing ? "Perbarui" : "Simpan & Latih"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};