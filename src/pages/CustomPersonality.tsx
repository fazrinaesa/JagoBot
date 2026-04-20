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
        alert("✨ Kepribadian Bot Berhasil Disimpan!");
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
      name: "Gaul & Ceria",
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presets Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="w-5 h-5 text-brand-orange" /> Pilih Gaya Bahasa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all duration-300",
                    selectedPreset === preset.id
                      ? "border-brand-orange bg-brand-orange/10 shadow-lg shadow-brand-orange/10"
                      : "border-white/10 hover:border-brand-orange/30 bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    selectedPreset === preset.id ? "bg-brand-orange text-white" : "bg-white/10 text-slate-400 shadow-sm"
                  )}>
                    <preset.icon className="w-5 h-5" />
                  </div>
                  <h4 className={cn(
                    "font-bold mb-1",
                    selectedPreset === preset.id ? "text-brand-orange" : "text-white"
                  )}>{preset.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-brand-blue p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">Instruksi Khusus</h3>
            <p className="text-sm text-slate-400 mb-4 font-medium">Berikan instruksi tambahan bagaimana bot harus bersikap. Contoh: "Selalu gunakan kata 'Kak' saat menyapa" atau "Jangan gunakan emoji".</p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tulis instruksi khusus di sini..."
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-4 focus:ring-brand-orange/10 outline-none text-white resize-none min-h-[150px] font-medium placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-brand-blue rounded-[2rem] p-8 text-white shadow-2xl shadow-brand-blue/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h3 className="font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-xs relative z-10">
              <MessageSquare className="w-4 h-4 text-brand-orange" /> Preview Suara Bot
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 italic text-sm leading-relaxed relative z-10 border border-white/10">
              "{presets.find(p => p.id === selectedPreset)?.preview}"
            </div>
            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-200">
                <span>Kreativitas</span>
                <span>Tinggi</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-brand-orange shadow-[0_0_15px_rgba(255,107,53,0.5)]" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-brand-orange text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Save className="w-6 h-6" /> Simpan Perubahan
          </button>

          <button className="w-full bg-white text-brand-blue border border-slate-200 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm">
            <Play className="w-5 h-5 text-brand-orange" /> Coba di Playground
          </button>
        </div>
      </div>
    </div>
  );
};