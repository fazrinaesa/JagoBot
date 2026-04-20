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
  const [editingTitle, setEditingTitle] = useState(""); // Default kosong agar user mengisi judul
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

  // --- ✅ FUNGSI HANDLE EDIT (MENGISI FORM MANUAL) ---
  const handleEdit = (file: any) => {
    setIsEditing(true);
    setEditingId(file.id);
    setEditingTitle(file.nama_sumber); // Mengisi input judul otomatis
    setManualText(file.isi_teks || ""); // Masukkan teks lama ke textarea

    // Scroll otomatis ke section manual text
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // --- ✅ FUNGSI BATAL EDIT ---
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTitle(""); // Reset judul
    setManualText(""); // Reset teks
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
    // Validasi Judul dan Isi Teks
    if (!editingTitle.trim() || !manualText.trim() || !activeBotId) {
      alert("Silakan masukkan judul dan teks informasi terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);
      // Mengirim data ke API /manual yang mendukung UPSERT
      await api.post("/knowledge/manual", {
        botId: activeBotId,
        title: editingTitle, // Menggunakan judul dari input field
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-brand-orange/5 border border-brand-orange/10 p-4 rounded-2xl flex gap-4">
        <Info className="w-6 h-6 text-brand-orange shrink-0" />
        <p className="text-sm text-brand-blue">
          <strong className="font-black uppercase tracking-tighter mr-1">Tips:</strong> Semakin detail informasi yang Anda berikan, semakin pintar bot Anda menjawab pertanyaan pelanggan. Unggah katalog produk atau tulis FAQ toko Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">Unggah Dokumen</h3>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,.docx" />
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-brand-orange transition-colors cursor-pointer group bg-white/5">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-brand-orange transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <p className="font-bold text-white">Klik atau seret file ke sini</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Mendukung PDF, TXT, DOCX (Maks. 10MB)</p>
          </div>

          <div className="mt-8 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Terunggah</h4>
            {isLoading && files.length === 0 ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-brand-orange animate-spin" /></div>
            ) : files.length > 0 ? (
              files.map((file, idx) => (
                <div key={file.id || idx} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl shadow-sm"><FileText className="w-5 h-5 text-brand-orange" /></div>
                    <div className="max-w-[120px] md:max-w-none overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{file.nama_sumber || file.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('id-ID') : file.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden md:block text-[10px] font-black px-2.5 py-1 bg-brand-orange/20 text-brand-orange rounded-full uppercase tracking-tighter">
                      {file.status === 'ready' ? 'TERSINKRON' : 'DIPROSES'}
                    </span>

                    {/* ✅ TOMBOL EDIT HANYA UNTUK TIPE TEXT/MANUAL */}
                    {file.tipe_sumber === 'text' && (
                      <button onClick={() => handleEdit(file)} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 text-xs py-8">Belum ada file terunggah.</p>
            )}
          </div>
        </div>

        {/* Manual Text Section */}
        <div className={`bg-brand-blue p-6 rounded-[2rem] border ${isEditing ? 'border-brand-orange ring-4 ring-brand-orange/10' : 'border-white/5'} shadow-xl flex flex-col transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {isEditing ? "Edit Informasi" : "Input Manual"}
            </h3>
            {isEditing ? (
              <button onClick={cancelEdit} className="text-[10px] font-black text-red-500 flex items-center gap-1 uppercase tracking-widest">
                <X className="w-3 h-3" /> Batal Edit
              </button>
            ) : (
              <button onClick={() => setEditingTitle("")} className="text-[10px] font-black text-brand-orange flex items-center gap-1 hover:opacity-80 transition-opacity uppercase tracking-widest">
                <Plus className="w-3 h-3" /> Tambah Baru
              </button>
            )}
          </div>

          {/* ✅ INPUT JUDUL INFORMASI (PENTING UNTUK UPSERT) */}
          <div className="mb-4">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              disabled={isEditing} // Judul dikunci saat edit agar tidak membuat baris baru secara tidak sengaja
              placeholder="Judul Informasi (Contoh: Jam Operasional)"
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-brand-orange/20 outline-none text-white font-bold placeholder:text-slate-500 transition-all disabled:opacity-50"
            />
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Tuliskan informasi penting toko Anda di sini... (Contoh: Jam operasional, alamat lengkap, cara pemesanan, dll.)"
            className="flex-1 w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-4 focus:ring-brand-orange/10 outline-none text-white resize-none min-h-[250px] font-medium placeholder:text-slate-500"
          />
          <div className="mt-6">
            <button
              onClick={handleManualSubmit}
              disabled={isLoading}
              className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              {isEditing ? "Perbarui & Latih Bot" : "Simpan & Latih Bot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};