import { MessageSquare, Globe, Code, Copy, Check, ExternalLink, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export const IntegrationSettings = () => {
  const [copied, setCopied] = useState(false);
  const widgetCode = `<script src="https://cdn.jagobot.id/widget.js" data-id="JB-9921-X"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Penyesuaian: Mengurangi space-y dan max-w agar lebih rapat
    <div className="space-y-5 max-w-5xl mx-auto px-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WhatsApp Integration */}
        {/* Penyesuaian: Padding p-6, radius 2xl */}
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
        {/* Penyesuaian: Warna orange diganti ke #1800ad, padding p-6 */}
        <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#1800ad]/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />

          <div className="w-12 h-12 bg-white/10 dark:bg-slate-900/10 text-[#1800ad] rounded-xl flex items-center justify-center mb-5 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Website Chat Widget</h3>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">
            Pasang widget chat di website toko online Anda. Pelanggan bisa langsung bertanya tanpa meninggalkan website.
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-black/20 text-blue-100 font-mono text-[9px] relative group/code border border-white/10">
              <code className="break-all">{widgetCode}</code>
              <button
                onClick={handleCopy}
                className="absolute right-1.5 top-1.5 p-1.5 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 dark:bg-slate-900/20 rounded-lg transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#1800ad]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button className="w-full bg-[#1800ad] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1800ad]/30">
              <Code className="w-4 h-4" /> Salin Kode Widget
            </button>
          </div>
        </div>
      </div>

      {/* Other Integrations */}
      {/* Penyesuaian: Menggunakan flex justify-center agar posisi Telegram & Discord tepat di tengah */}
      <div className="bg-brand-blue p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">
          Integrasi Lainnya <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 ml-2">(Segera Hadir)</span>
        </h3>

        {/* Penyesuaian: Menggunakan flexbox untuk memposisikan item ke tengah */}
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
    </div>
  );
};