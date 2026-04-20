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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Integration */}
        <div className="bg-brand-blue p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <MessageSquare className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">WhatsApp Business API</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            Hubungkan JagoBot ke nomor WhatsApp bisnis Anda. Balas pesan pelanggan secara otomatis 24/7 tanpa henti.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status: <span className="text-white">Belum Terhubung</span></span>
            </div>
            <button className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" /> Hubungkan WhatsApp
            </button>
          </div>
        </div>

        {/* Website Widget Integration */}
        <div className="bg-brand-blue p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="w-14 h-14 bg-white/10 text-brand-orange rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Globe className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Website Chat Widget</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            Pasang widget chat di website toko online Anda. Pelanggan bisa langsung bertanya tanpa meninggalkan website.
          </p>
          
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-black/20 text-blue-100 font-mono text-[10px] relative group/code border border-white/10">
              <code className="break-all">{widgetCode}</code>
              <button 
                onClick={handleCopy}
                className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-brand-orange" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button className="w-full bg-brand-orange text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/30">
              <Code className="w-5 h-5" /> Salin Kode Widget
            </button>
          </div>
        </div>
      </div>

      {/* Other Integrations */}
      <div className="bg-brand-blue p-8 rounded-[2rem] border border-white/5 shadow-xl">
        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Integrasi Lainnya <span className="text-xs font-black text-slate-500 ml-2">(Segera Hadir)</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Instagram DM", "Telegram", "Facebook Messenger", "Line"].map((platform) => (
            <div key={platform} className="p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed group bg-white/5">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors border border-white/10">
                <Smartphone className="w-6 h-6 text-slate-500 group-hover:text-brand-orange" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Link */}
      <div className="text-center py-8">
        <a href="#" className="inline-flex items-center gap-2 text-brand-orange font-black uppercase tracking-widest text-xs hover:gap-3 transition-all">
          Butuh bantuan integrasi? Lihat Dokumentasi Lengkap <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
