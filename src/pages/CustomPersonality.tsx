import { Sparkles, MessageSquare, Save, Play, UserCircle2, Smile, Briefcase } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export const CustomPersonality = () => {
  const [selectedPreset, setSelectedPreset] = useState("formal");
  const [customPrompt, setCustomPrompt] = useState("");

  // --- FUNGSI HANDLE SAVE (PERBAIKAN VALIDASI JSON & DYNAMIC ID) ---
  const handleSave = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      // Inisialisasi dynamicBotId sebagai null agar validasi lebih ketat
      let dynamicBotId = null;

      if (storedUser && storedUser !== "undefined") {
        try {
          const userData = JSON.parse(storedUser);
          // Mengambil botId dari data login yang dikirim backend baru
          dynamicBotId = userData?.botId || userData?.id;
        } catch (parseError) {
          console.error("Gagal parse data user:", parseError);
        }
      }

      // Jika tetap tidak ditemukan, tampilkan peringatan agar user login ulang
      if (!dynamicBotId) {
        alert("Sesi login tidak valid atau ID Bot tidak ditemukan. Silakan Logout lalu Login kembali!");
        return;
      }

      const response = await fetch('http://localhost:5000/api/bot/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: dynamicBotId,
          personality: selectedPreset,
          instructions: customPrompt,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✨ Profil Bot Berhasil Disimpan!");
        console.log("Update Success for Bot ID:", dynamicBotId, result.data);
      } else {
        alert("Gagal menyimpan: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error saat menyimpan:", error);
      alert("Koneksi ke server gagal. Pastikan backend menyala!");
    }
  };
  // --------------------------------------------

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
            <h3 className="font-bold mb-5 flex items-center gap-2 uppercase tracking-widest text-[10px] relative z-10">
              <MessageSquare className="w-3.5 h-3.5 text-white" /> Preview Suara Bot
            </h3>
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
            // Penyesuaian: padding py-4 dan text-base
            className="w-full bg-[#1800ad] text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-[#1800ad]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Simpan Perubahan
          </button>

          <button className="w-full bg-white dark:bg-slate-900 text-brand-blue dark:text-white border border-slate-200 dark:border-slate-800 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 dark:bg-slate-800/50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Play className="w-4 h-4 text-[#1800ad]" /> Coba di Playground
          </button>
        </div>
      </div>
    </div>
  );
};