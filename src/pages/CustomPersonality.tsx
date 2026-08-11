import { Sparkles, MessageSquare, Save, Play, UserCircle2, Smile, Briefcase, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { updateBotSettings } from "../lib/api";

export const CustomPersonality = () => {
  const [selectedPreset, setSelectedPreset] = useState("casual");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [botName, setBotName] = useState("Bot Anda");

  // ✅ Load data profil bot yang sudah tersimpan saat halaman dibuka
  useEffect(() => {
    const loadBotProfile = async () => {
      try {
        setIsLoading(true);
        const activeBotId = localStorage.getItem('activeBotId');
        const token = localStorage.getItem('token');

        if (!activeBotId || !token) {
          console.warn("⚠️ activeBotId atau token tidak ditemukan di localStorage");
          setIsLoading(false);
          return;
        }

        console.log("🔵 [Profil Bot] Loading bot profile for botId:", activeBotId);

        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/bot/profile?botId=${activeBotId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          const bot = result.data;
          console.log("✅ [Profil Bot] Data loaded:", bot);
          if (bot.personality) setSelectedPreset(bot.personality);
          if (bot.instructions) setCustomPrompt(bot.instructions);
          if (bot.nama_bot) setBotName(bot.nama_bot);
        } else {
          console.warn("⚠️ [Profil Bot] Gagal load profile, response:", response.status);
        }
      } catch (error) {
        console.error("❌ [Profil Bot] Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBotProfile();
  }, []);

  // ✅ FIX: Gunakan activeBotId dari localStorage + sertakan Authorization token
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // ✅ FIX #1: Ambil botId dari localStorage (bukan dari user object)
      const activeBotId = localStorage.getItem('activeBotId');

      console.log("🔵 [Profil Bot] activeBotId dari localStorage:", activeBotId);

      if (!activeBotId) {
        alert("❌ Tidak ada project yang aktif. Silakan pilih project dari Navbar terlebih dahulu.");
        return;
      }

      console.log("📤 [Profil Bot] Menyimpan profil:", { botId: activeBotId, personality: selectedPreset });

      // ✅ FIX #2: Gunakan api utility yang sudah include token otomatis via interceptor
      const response = await updateBotSettings(Number(activeBotId), selectedPreset, customPrompt);

      if (response.status === 200) {
        alert("✨ Profil Bot Berhasil Disimpan!");
        console.log("✅ [Profil Bot] Update success:", response.data);
      } else {
        alert("Gagal menyimpan: " + (response.data?.message || "Terjadi kesalahan"));
      }
    } catch (error: any) {
      console.error("❌ [Profil Bot] Error saat menyimpan:", error);
      alert("Koneksi ke server gagal: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const presets = [
    {
      id: "formal",
      name: "Formal & Sopan",
      icon: Briefcase,
      desc: "Cocok untuk bisnis profesional, jasa hukum, atau instansi.",
      preview: "Selamat siang Bapak/Ibu. Ada yang bisa saya bantu terkait layanan kami hari ini?"
    },
    {
      id: "casual",
      name: "Ramah & Profesional",
      icon: Smile,
      desc: "Cocok untuk toko baju, cafe, atau produk anak muda.",
      preview: "Halo Kak! 👋 Wah, seneng banget bisa ketemu Kakak. Mau cari produk apa nih hari ini?"
    },
    {
      id: "helpful",
      name: "Asisten Ramah",
      icon: UserCircle2,
      desc: "Gaya bicara yang membantu dan fokus pada solusi.",
      preview: "Halo! Saya di sini untuk membantu Anda. Silakan tanyakan apa saja tentang produk kami."
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#1800ad]" />
        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Profil Bot...</span>
      </div>
    );
  }

  return (
    // Penyesuaian: max-w-6xl agar lebih proporsional di layar 100%
    <div className="space-y-5 max-w-6xl mx-auto px-4 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Presets Selection */}
        <div className="lg:col-span-2 space-y-5">
          {/* Penyesuaian: padding dikurangi (p-5) dan rounded (rounded-2xl) */}
          <div className="bg-brand-blue p-5 rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-white" /> Pilih Gaya Bahasa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-300",
                    selectedPreset === preset.id
                      ? "border-[#1800ad] bg-[#1800ad]/10 shadow-lg shadow-[#1800ad]/10"
                      : "border-white/10 hover:border-[#1800ad]/30 bg-white/5 dark:bg-slate-900/5"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors",
                    selectedPreset === preset.id ? "bg-[#1800ad] text-white shadow-lg shadow-[#1800ad]/30" : "bg-white/20 dark:bg-slate-900/10 text-white shadow-sm"
                  )}>
                    <preset.icon className="w-4 h-4" />
                  </div>
                  <h4 className={cn(
                    "text-sm font-bold mb-1",
                    selectedPreset === preset.id ? "text-[#1800ad]" : "text-white"
                  )}>{preset.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-brand-blue p-5 rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 uppercase tracking-tight">Instruksi Khusus</h3>
            <p className="text-xs text-slate-400 mb-3 font-medium leading-relaxed">Berikan instruksi tambahan bagaimana bot harus bersikap. Contoh: "Selalu gunakan kata 'Kak' saat menyapa" atau "Jangan gunakan emoji".</p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tulis instruksi khusus di sini..."
              // Penyesuaian: padding p-4 dan min-h berkurang agar pas
              className="w-full p-4 rounded-xl bg-white/5 dark:bg-slate-900/5 border border-white/10 focus:ring-2 focus:ring-[#1800ad]/20 outline-none text-white text-sm resize-none min-h-[120px] font-medium placeholder:text-slate-500 dark:text-slate-400"
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-5">
          {/* Penyesuaian: padding p-6 dan radius 3xl */}
          <div className="bg-brand-blue rounded-3xl p-6 text-white shadow-2xl shadow-brand-blue/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1800ad]/10 rounded-full blur-2xl -mr-12 -mt-12" />
            <h3 className="font-bold mb-1 flex items-center gap-2 uppercase tracking-widest text-[10px] relative z-10">
              <MessageSquare className="w-3.5 h-3.5 text-white" /> Preview Suara Bot
            </h3>
            <p className="text-[9px] text-slate-400 mb-4 font-medium relative z-10">{botName}</p>
            <div className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-md rounded-xl p-4 italic text-xs leading-relaxed relative z-10 border border-white/10">
              "{presets.find(p => p.id === selectedPreset)?.preview}"
            </div>
            <div className="mt-6 space-y-3 relative z-10">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-blue-200">
                <span>Kreativitas</span>
                <span>Tinggi</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 dark:bg-slate-900/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#1800ad] shadow-[0_0_15px_rgba(24,0,173,0.5)]" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            // Penyesuaian: padding py-4 dan text-base
            className="w-full bg-[#1800ad] text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-[#1800ad]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-5 h-5" /> Simpan Perubahan</>
            )}
          </button>

          <button className="w-full bg-white dark:bg-slate-900 text-brand-blue dark:text-white border border-slate-200 dark:border-slate-800 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 dark:bg-slate-800/50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Play className="w-4 h-4 text-[#1800ad]" /> Coba di Playground
          </button>
        </div>
      </div>
    </div>
  );
};