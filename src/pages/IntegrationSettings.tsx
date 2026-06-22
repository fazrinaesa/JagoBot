import { MessageSquare, Globe, Code, Copy, Check, ExternalLink, Smartphone, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export const IntegrationSettings = () => {
  // ==========================================
  // STEP 1: IDENTIFIKASI DATA BOT AKTIF
  // ==========================================
  const [activeBotId, setActiveBotId] = useState<string | null>(
    localStorage.getItem('activeBotId')
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveBotId(localStorage.getItem('activeBotId'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ==========================================
  // STEP 2 & 3: STATE KONTROL MODAL DIALOG
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ==========================================
  // STEP 5: BUAT STRING KODE SNIPPET SECARA DINAMIS
  // ==========================================
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const snippetCode = `<script \n  src="${apiUrl}/widget/jagobot.js" \n  data-bot-id="${activeBotId || 'JB-PENDING'}"></script>`;

  // ==========================================
  // STEP 6: LOGIKA "COPY TO CLIPBOARD" DENGAN FEEDBACK VISUAL
  // ==========================================
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setIsCopied(true);
      // Kembalikan teks tombol menjadi semula setelah 2 detik
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin kode integrasi: ", err);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-4 pb-10">

      {/* Indikator Monitoring Data Bot Aktif (Step 1) */}
      <div className="bg-brand-blue p-4 rounded-xl border border-white/5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#1800ad] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Bot Id Teridentifikasi:
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-white bg-white/10 dark:bg-slate-900/40 px-3 py-1 rounded-lg border border-white/20 shadow-inner">
          {activeBotId || "BELUM MEMILIH PROJECT"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WhatsApp Integration */}
        <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />

          <div className="w-12 h-12 bg-white/10 dark:bg-slate-900/10 text-emerald-400 rounded-xl flex items-center justify-center mb-5 shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">WhatsApp Business API</h3>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">
            Hubungkan JagoBot ke nomor WhatsApp bisnis Anda. Balas pesan pelanggan secara otomatis 24/7 tanpa henti.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 dark:bg-slate-900/5 border border-white/10">
              <div className="w-1.5 h-1.5 bg-slate-50 dark:bg-slate-800/500 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: <span className="text-white">Belum Terhubung</span></span>
            </div>
            <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-4 h-4" /> Hubungkan WhatsApp
            </button>
          </div>
        </div>

        {/* Website Widget Integration */}
        <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />

          <div className="w-12 h-12 bg-white/10 dark:bg-slate-900/10 text-[#1800ad] rounded-xl flex items-center justify-center mb-5 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Website Chat Widget</h3>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">
            Pasang widget chat di website toko online Anda. Pelanggan bisa langsung bertanya tanpa meninggalkan website.
          </p>

          <div className="space-y-3">
            {/* BOX PREVIEW KODE: Telah disesuaikan agar menampilkan kode dinamis nyata */}
            <div className="p-4 rounded-xl bg-black/20 text-blue-100 font-mono text-[9px] relative group/code border border-white/10">
              <code className="break-all">{snippetCode}</code>
              <button
                onClick={handleCopyCode}
                className="absolute right-1.5 top-1.5 p-1.5 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 dark:bg-slate-900/20 rounded-lg transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#1800ad]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* PENYESUAIAN STEP 2 & 3 UI: Menghubungkan fungsi klik untuk membuka modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#1800ad] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1800ad]/30"
            >
              <Code className="w-4 h-4" /> Salin Kode Widget
            </button>
          </div>
        </div>
      </div>

      {/* Other Integrations */}
      <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">
          Integrasi Lainnya <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 ml-2">(Segera Hadir)</span>
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {["Telegram", "Discord"].map((platform) => (
            <div
              key={platform}
              className="w-full max-w-[160px] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed group bg-white/5 dark:bg-slate-900/5"
            >
              <div className="w-10 h-10 bg-white/10 dark:bg-slate-900/10 rounded-xl flex items-center justify-center group-hover:bg-[#1800ad]/10 transition-colors border border-white/10">
                <Smartphone className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#1800ad]" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                {platform}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Link */}
      <div className="text-center py-6">
        <a href="#" className="inline-flex items-center gap-2 text-[#1800ad] font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
          Butuh bantuan integrasi? Lihat Dokumentasi Lengkap <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ======================================================= */}
      {/* STEP 4, 5, & 6: IMPLEMENTASI STRUKTUR UTAMA MODAL DIALOG */}
      {/* ======================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-brand-blue border border-white/10 p-6 rounded-[1.5rem] max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1800ad]/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

            {/* HEADER MODAL: Judul & Tombol Tutup Silang */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1800ad]" /> Integrasi Widget Live Chat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)} // Tombol Tutup Atas
                className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DESKRIPSI MODAL */}
            <div className="space-y-1">
              <p className="text-white font-bold text-xs uppercase tracking-wide">Cara Pemasangan:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                Salin snippet kode HTML di bawah ini, kemudian tempelkan (paste) tepat sebelum tag penutup <code className="text-blue-400 font-mono">&lt;/body&gt;</code> di dalam file HTML utama website klien Anda.
              </p>
            </div>

            {/* BOX SNIPPET CODE DINAMIS & TOMBOL SALIN INSTAN */}
            <div className="space-y-2">
              <div className="p-4 rounded-xl bg-black/40 text-blue-100 font-mono text-[10px] relative group/modalcode border border-white/5 min-h-[60px] flex items-center pr-12">
                <pre className="break-all text-left block w-full leading-normal text-slate-300 whitespace-pre-wrap">
                  <code>{snippetCode}</code>
                </pre>

                {/* Tombol Akses Cepat Salin */}
                <button
                  onClick={handleCopyCode}
                  title="Salin Kode"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* FOOTER ACTION: Tombol Tutup Utama & Status Feedback */}
            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                onClick={() => setIsModalOpen(false)} // Tombol Tutup Kembali
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleCopyCode}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2",
                  isCopied
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-[#1800ad] text-white hover:scale-[1.02] active:scale-[0.98] shadow-[#1800ad]/20"
                )}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Tersalin! ✅
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Kode
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};