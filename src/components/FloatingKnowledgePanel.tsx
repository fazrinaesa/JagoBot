import { Upload, CheckCircle2, Loader2, X, Plus, Minimize2, FileUp, PenLine } from "lucide-react";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import api from "../lib/api";
import { Button, Input, Textarea } from "./ui";

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
  isLoading,
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
        content: manualText,
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
        className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-lift transition-all hover:scale-110 active:scale-95 focus-ring"
        title="Buka Panel Knowledge Base"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
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
            className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-pop animate-pop-in dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-6 pb-4 pt-5 dark:border-neutral-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                    Tambah Pengetahuan
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Upload dokumen atau input teks manual
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMinimize()}
                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  title="Minimize"
                >
                  <Minimize2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => handleClose()}
                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Konten */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Bagian 1: Upload file */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/10 text-[11px] font-bold text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
                      1
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-200">
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
                    className="group cursor-pointer rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center transition-all hover:border-accent-blue/50 hover:bg-accent-blue/5 hover:shadow-hover-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800/30 dark:hover:border-accent-blue/50 dark:hover:bg-accent-blue/10"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-white shadow-soft transition-all group-hover:bg-accent-blue/10 dark:border-neutral-700 dark:bg-neutral-800">
                      <Upload className="h-6 w-6 text-neutral-400 transition-colors group-hover:text-accent-blue dark:group-hover:text-accent-blue-light" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      {uploadLoading ? "Mengunggah..." : "Klik atau Tarik File"}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      PDF, DOCX, TXT (Maks 10MB)
                    </p>
                  </div>
                </section>

                {/* Bagian 2: Input manual */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-violet/10 text-[11px] font-bold text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
                      2
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-200">
                      Input Manual
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <PenLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        placeholder="Judul Informasi"
                        className="pl-10 font-semibold"
                      />
                    </div>
                    <Textarea
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Tuliskan detail informasi toko Anda..."
                      className="min-h-[176px]"
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 border-t border-border-subtle bg-neutral-50/60 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/30">
              <Button variant="ghost" onClick={() => handleClose()}>
                Batal
              </Button>
              <Button onClick={handleManualSubmit} disabled={uploadLoading}>
                {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Simpan & Latih
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
