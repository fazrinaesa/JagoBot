import { Upload, FileText, Trash2, Plus, Info, CheckCircle2, Loader2, Edit3, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import api, { getKnowledgeBaseList, getActiveBot } from "../lib/api";

export const KnowledgeBase = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [manualText, setManualText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeBotId, setActiveBotId] = useState<number | null>(null);
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
      } else {
        console.warn("Peringatan: Bot ID tidak ditemukan. Pastikan bot sudah dibuat.");
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

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTitle("");
    setManualText("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBotId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", activeBotId.toString());

    try {
      setIsLoading(true);
      await api.post("/knowledge/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Dokumen berhasil diunggah!");
      fetchInitialData();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah file.");
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
      await api.post("/knowledge/manual", {
        botId: activeBotId,
        title: editingTitle,
        content: manualText
      });

      alert(isEditing ? "Informasi berhasil diperbarui!" : "Informasi berhasil disimpan dan bot sedang dilatih!");
      cancelEdit();
      fetchInitialData();
    } catch (error) {
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
    // Penyesuaian: Menggunakan max-w-6xl agar tidak terlalu lebar di monitor besar
    <div className="space-y-5 max-w-6xl mx-auto px-4 pb-10">
      {/* Penyesuaian: Mengurangi padding (p-3) dan ukuran font (text-xs) */}
      <div className="bg-[#1800ad]/5 border border-[#1800ad]/10 p-3 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-[#1800ad] shrink-0" />
        <p className="text-xs text-brand-blue dark:text-white leading-relaxed">
          <strong className="font-black uppercase tracking-tighter mr-1">Tips:</strong> Semakin detail informasi yang Anda berikan, semakin pintar bot Anda menjawab pertanyaan pelanggan. Unggah katalog produk atau tulis FAQ toko Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* File Upload Section */}
        {/* Penyesuaian: Mengurangi border radius (rounded-3xl) dan padding (p-5) */}
        <div className="bg-brand-blue p-5 rounded-[1.5rem] border border-white/5 shadow-xl">
          <h3 className="text-base font-black text-white mb-4 uppercase tracking-tight">Unggah Dokumen</h3>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,.docx" />

          {/* Penyesuaian: Mengurangi padding dropzone (p-6) dan ukuran icon (w-12 h-12) */}
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-[#1800ad] transition-colors cursor-pointer group bg-white/5 dark:bg-slate-900/5">
            <div className="w-12 h-12 bg-white/10 dark:bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:bg-[#1800ad] transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Klik atau seret file ke sini</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Mendukung PDF, TXT, DOCX (Maks. 10MB)</p>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">File Terunggah</h4>
            {isLoading && files.length === 0 ? (
              <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 text-[#1800ad] animate-spin" /></div>
            ) : files.length > 0 ? (
              files.map((file, idx) => (
                <div key={file.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900/5">
                  <div className="flex items-center gap-3">
                    {/* Penyesuaian: Mengurangi ukuran icon file */}
                    <div className="p-2 bg-white/10 dark:bg-slate-900/10 rounded-lg shadow-sm"><FileText className="w-4 h-4 text-[#1800ad]" /></div>
                    <div className="max-w-[120px] md:max-w-none overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{file.nama_sumber || file.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('id-ID') : file.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="hidden md:block text-[8px] font-black px-2 py-0.5 bg-[#1800ad]/20 text-[#1800ad] rounded-full uppercase tracking-tighter">
                      {file.status === 'ready' ? 'TERSINKRON' : 'DIPROSES'}
                    </span>

                    {file.tipe_sumber === 'text' && (
                      <button onClick={() => handleEdit(file)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 text-[10px] py-6">Belum ada file terunggah.</p>
            )}
          </div>
        </div>

        {/* Manual Text Section */}
        {/* Penyesuaian: Mengurangi padding (p-5) dan radius (rounded-3xl) */}
        <div className={`bg-brand-blue p-5 rounded-[1.5rem] border ${isEditing ? 'border-[#1800ad] ring-2 ring-[#1800ad]/10' : 'border-white/5'} shadow-xl flex flex-col transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              {isEditing ? "Edit Informasi" : "Input Manual"}
            </h3>
            {isEditing ? (
              <button onClick={cancelEdit} className="text-[9px] font-black text-red-500 flex items-center gap-1 uppercase tracking-widest">
                <X className="w-3 h-3" /> Batal Edit
              </button>
            ) : (
              <button onClick={() => setEditingTitle("")} className="text-[9px] font-black text-[#1800ad] flex items-center gap-1 hover:opacity-80 transition-opacity uppercase tracking-widest">
                <Plus className="w-3 h-3" /> Tambah Baru
              </button>
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              disabled={isEditing}
              placeholder="Judul Informasi (Contoh: Jam Operasional)"
              // Penyesuaian: Padding (p-3) dan font size (text-sm)
              className="w-full p-3 rounded-lg bg-white/5 dark:bg-slate-900/5 border border-white/10 focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-white text-sm font-bold placeholder:text-slate-500 dark:text-slate-400 transition-all disabled:opacity-50"
            />
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Tuliskan informasi penting toko Anda di sini..."
            // Penyesuaian: Padding (p-4), font size (text-sm), dan min-h berkurang
            className="flex-1 w-full p-4 rounded-xl bg-white/5 dark:bg-slate-900/5 border border-white/10 focus:ring-2 focus:ring-[#1800ad]/10 outline-none text-white text-sm resize-none min-h-[200px] font-medium placeholder:text-slate-500 dark:text-slate-400"
          />
          <div className="mt-5">
            <button
              onClick={handleManualSubmit}
              disabled={isLoading}
              // Penyesuaian: Padding vertikal (py-3) dan font (text-base)
              className="w-full bg-[#1800ad] text-white py-3 rounded-xl font-black text-base shadow-lg shadow-[#1800ad]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isEditing ? "Perbarui & Latih Bot" : "Simpan & Latih Bot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};