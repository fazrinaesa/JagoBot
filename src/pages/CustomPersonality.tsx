import { Sparkles, MessageSquare, Save, Play, UserCircle2, Smile, Briefcase, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { updateBotSettings } from "../lib/api";
import { Badge, Button, Card, Textarea } from "../components/ui";

export const CustomPersonality = () => {
  const [selectedPreset, setSelectedPreset] = useState("casual");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [botName, setBotName] = useState("Bot Anda");

  // Load data profil bot yang sudah tersimpan saat halaman dibuka
  useEffect(() => {
    const loadBotProfile = async () => {
      try {
        setIsLoading(true);
        const activeBotId = localStorage.getItem("activeBotId");
        const token = localStorage.getItem("token");

        if (!activeBotId || !token) {
          console.warn("⚠️ activeBotId atau token tidak ditemukan di localStorage");
          setIsLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/bot/profile?botId=${activeBotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          const bot = result.data;
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

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const activeBotId = localStorage.getItem("activeBotId");

      if (!activeBotId) {
        alert("❌ Tidak ada project yang aktif. Silakan pilih project dari Navbar terlebih dahulu.");
        return;
      }

      const response = await updateBotSettings(Number(activeBotId), selectedPreset, customPrompt);

      if (response.status === 200) {
        alert("✨ Profil Bot Berhasil Disimpan!");
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
      preview: "Selamat siang Bapak/Ibu. Ada yang bisa saya bantu terkait layanan kami hari ini?",
    },
    {
      id: "casual",
      name: "Ramah & Profesional",
      icon: Smile,
      desc: "Cocok untuk toko baju, cafe, atau produk anak muda.",
      preview: "Halo Kak! 👋 Wah, seneng banget bisa ketemu Kakak. Mau cari produk apa nih hari ini?",
    },
    {
      id: "helpful",
      name: "Asisten Ramah",
      icon: UserCircle2,
      desc: "Gaya bicara yang membantu dan fokus pada solusi.",
      preview: "Halo! Saya di sini untuk membantu Anda. Silakan tanyakan apa saja tentang produk kami.",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin text-accent-blue dark:text-accent-blue-light" />
        <span className="animate-pulse text-xs font-semibold uppercase tracking-widest">Memuat Profil Bot...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Pilih gaya bahasa */}
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet dark:bg-accent-violet/15 dark:text-accent-violet-light">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                Pilih Gaya Bahasa
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative rounded-2xl border-2 p-4 text-left transition-all duration-200 focus-ring",
                      isSelected
                        ? "border-accent-blue bg-gradient-to-br from-accent-blue/[0.07] to-accent-violet/[0.05] shadow-card ring-2 ring-accent-blue/30 ring-offset-2 ring-offset-white dark:from-accent-blue/15 dark:to-accent-violet/10 dark:ring-offset-neutral-900"
                        : "border-border-subtle bg-white hover:-translate-y-0.5 hover:border-accent-blue/50 hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900/50"
                    )}
                  >
                    {/* Check indicator di pojok */}
                    {isSelected && (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-soft ring-2 ring-white dark:ring-neutral-900">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}

                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                        isSelected
                          ? "bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-soft"
                          : "bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700"
                      )}
                    >
                      <preset.icon className="h-4.5 w-4.5" />
                    </div>
                    <h4
                      className={cn(
                        "mb-1 text-sm font-bold",
                        isSelected ? "text-accent-blue dark:text-accent-blue-light" : "text-neutral-900 dark:text-white"
                      )}
                    >
                      {preset.name}
                    </h4>
                    <p className="text-[11px] font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {preset.desc}
                    </p>

                    <span
                      className={cn(
                        "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                        isSelected
                          ? "bg-accent-blue text-white"
                          : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                      )}
                    >
                      {isSelected ? "✓ Dipilih" : "Pilih gaya"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Instruksi khusus */}
          <Card className="p-6">
            <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Instruksi Khusus
            </h3>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Berikan instruksi tambahan bagaimana bot harus bersikap. Contoh: "Selalu gunakan kata
              'Kak' saat menyapa" atau "Jangan gunakan emoji".
            </p>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tulis instruksi khusus di sini..."
              className="min-h-[130px]"
            />
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-5">
          <Card className="relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent-violet/10 blur-2xl" />

            <div className="relative z-10 p-6">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <MessageSquare className="h-3.5 w-3.5" /> Preview Suara Bot
              </div>
              <p className="mb-4 text-[11px] font-medium text-neutral-400">{botName}</p>

              <div className="rounded-2xl border border-border-subtle bg-neutral-50 p-4 text-xs italic leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-200">
                "{presets.find((p) => p.id === selectedPreset)?.preview}"
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  <span>Kreativitas</span>
                  <span className="text-accent-blue dark:text-accent-blue-light">Tinggi</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-accent-blue to-accent-violet" />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl bg-accent-green/5 px-3 py-2.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
                <span className="text-[11px] font-semibold text-accent-green-dark dark:text-accent-green-light">
                  Bot siap merespon pelanggan
                </span>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={isSaving} className="w-full py-3.5 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" /> Simpan Perubahan
              </>
            )}
          </Button>

          <Button variant="secondary" className="w-full py-3.5 text-sm">
            <Play className="h-4 w-4 text-accent-blue dark:text-accent-blue-light" /> Coba di Playground
          </Button>
        </div>
      </div>
    </div>
  );
};
