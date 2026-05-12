import { Upload, FileText, CheckCircle2, Loader2, Edit3, X, Plus, Minimize2, Maximize2 } from "lucide-react";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import api from "../lib/api";

interface FloatingKnowledgePanelProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  activeBotId: number | null;
  onUploadSuccess: () => void;
  isLoading: boolean;
}

export const FloatingKnowledgePanel = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onMaximize,
  activeBotId,
  onUploadSuccess,
  isLoading
}: FloatingKnowledgePanelProps) => {
  const [manualText, setManualText] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBotId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", activeBotId.toString());

    try {
      setUploadLoading(true);
      const response = await api.post("/knowledge/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data.success) {
        alert("✅ Dokumen berhasil diunggah!");
        onUploadSuccess();
        handleClose();
      } else {
        alert("❌ Gagal: " + (response.data.message || "Terjadi kesalahan"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("❌ Gagal mengunggah file: " + (error.response?.data?.message || "Internal Server Error"));
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = async () => {
    if (!editingTitle.trim() || !manualText.trim() || !activeBotId) {
      alert("⚠️ Silakan masukkan judul dan teks informasi terlebih dahulu.");
      return;
    }

    try {
      setUploadLoading(true);
      const response = await api.post("/knowledge/manual", {
        botId: activeBotId,
        title: editingTitle,
        content: manualText
      });

      if (response.data.success) {
        alert("✅ " + (isEditing ? "Informasi berhasil diperbarui!" : "Informasi berhasil disimpan!"));
        cancelEdit();
        onUploadSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error("Manual save error:", error);
      alert("❌ Gagal menyimpan informasi manual.");
    } finally {
      setUploadLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTitle("");
    setManualText("");
  };

  const handleClose = () => {
    cancelEdit();
    onClose();
  };

  if (isMinimized && isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={onMaximize}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-[#1800ad] to-blue-600 rounded-full shadow-2xl shadow-[#1800ad]/50 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group"
        title="Buka Panel Knowledge Base"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleClose()}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-3xl flex flex-col border border-white/10 overflow-hidden max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#1800ad] to-blue-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    Tambah Pengetahuan
                  </h3>
                  <p className="text-xs text-blue-100">Upload dokumen atau input teks manual</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onMinimize()} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => handleClose()} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: File Upload */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1800ad]/10 flex items-center justify-center text-[10px] font-bold text-[#1800ad]">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                      Unggah File
                    </h4>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.txt,.docx" 
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center hover:border-[#1800ad] hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/20"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-[#1800ad] transition-all">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-white">
                      {uploadLoading ? "Mengunggah..." : "Klik atau Tarik File"}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                      PDF, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                </section>

                {/* Section 2: Manual Text */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1800ad]/10 flex items-center justify-center text-[10px] font-bold text-[#1800ad]">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                      Input Manual
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
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-slate-700 dark:text-white text-sm min-h-[160px] resize-none font-medium placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
              <button
                onClick={() => handleClose()}
                className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={uploadLoading}
                className="px-8 py-3.5 bg-[#1800ad] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#1800ad]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Simpan & Latih
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
