import { Send, Bot, User, RotateCcw, Info } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: string;
}

export const ChatbotPlayground = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Halo! Saya asisten JagoBot Anda. Ada yang bisa saya bantu hari ini?", sender: "bot", timestamp: "10:00" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log("═══════════════════════════════════════════════════════");
    console.log("💬 [Playground] Sending message");
    
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    // ✅ FIX: Ambil activeBotId dari localStorage (bukan dari user object)
    const storedActiveBotId = localStorage.getItem("activeBotId");
    const activeBotId = storedActiveBotId ? Number(storedActiveBotId) : null;

    // ✅ DEBUG: Log untuk memastikan botId diambil dengan benar
    console.log("👤 User from localStorage:", storedUser);
    console.log("🔑 Stored activeBotId:", storedActiveBotId);
    console.log("🤖 Numeric activeBotId:", activeBotId);

    if (!activeBotId) {
      console.error("❌ activeBotId tidak ditemukan di localStorage");
      alert("Sesi tidak valid, silakan login ulang.");
      return;
    }

    console.log("✅ Bot ID valid, proceeding with message...");
    console.log("💭 Message content:", input);
    console.log("═══════════════════════════════════════════════════════\n");

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const requestBody = {
        botId: activeBotId,
        customerName: storedUser.nama_lengkap || storedUser.nama_toko || "User Jago",
        message: currentInput
      };

      console.log("📤 [Playground] Sending request to /api/chat/send");
      console.log("📦 Request payload:", requestBody);

      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestBody)
      });

      console.log("📥 [Playground] Response status:", response.status);
      const result = await response.json();

      console.log("📥 [Playground] Response data:", result);

      if (result.status === "success") {
        const botResponse = result.data.aiResponse || result.data.jawaban || "Bot tidak memberikan respon.";
        console.log("✅ [Playground] Bot response extracted:", botResponse);
        
        const botMsg: Message = {
          id: Date.now() + 1,
          text: botResponse,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("❌ [Playground] Gagal mengirim pesan:", error);
      const errorMsg: Message = {
        id: Date.now() + 2,
        text: "Maaf, terjadi gangguan koneksi ke otak bot. Silakan coba lagi.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      console.log("═══════════════════════════════════════════════════════\n");
    }
  };

  return (
    // Penyesuaian: Memperbesar container dengan menyisakan sedikit margin (space) di sisi kiri & kanan
    <div className="h-[calc(100vh-120px)] w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] mx-auto flex flex-col bg-brand-blue rounded-[1.5rem] border border-white/5 shadow-2xl shadow-brand-blue/20 overflow-hidden">
      {/* Chat Header */}
      {/* Penyesuaian: Mengurangi padding (py-5 -> py-3, px-8 -> px-6) */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/5 dark:bg-slate-900/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Warna: orange -> #1800ad, Size: 12 -> 10 */}
          <div className="w-10 h-10 bg-[#1800ad] rounded-xl flex items-center justify-center shadow-lg shadow-[#1800ad]/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Uji Coba Bot</h3>
            <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ id: 1, text: "Halo! Saya asisten JagoBot Anda. Ada yang bisa saya bantu hari ini?", sender: "bot", timestamp: "10:00" }])}
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/10 dark:bg-slate-900/10 rounded-lg"
          title="Reset Percakapan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      {/* Penyesuaian: Mengurangi padding (p-8 -> p-6) dan space-y (8 -> 6) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-blue/50">
        {/* Warna: orange -> #1800ad */}
        <div className="bg-white/5 dark:bg-slate-900/5 p-4 rounded-xl flex gap-3 mb-2 border border-white/10">
          <Info className="w-4 h-4 text-[#1800ad] shrink-0" />
          <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
            Gunakan area ini untuk mencoba bagaimana bot Anda merespon pertanyaan pelanggan. Respon di sini menggunakan data dari Knowledge Base dan Profil Bot yang telah Anda atur.
          </p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Warna: orange -> #1800ad, Size: 10 -> 8 */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
              msg.sender === "bot" ? "bg-white/20 dark:bg-slate-900/10 text-white border border-white/10" : "bg-[#1800ad] text-white"
            )}>
              {msg.sender === "bot" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              {/* Penyesuaian: padding px-5 -> px-4, py-4 -> py-3, radius 1.5rem -> 1rem */}
              <div className={cn(
                "px-4 py-3 rounded-[1rem] text-xs leading-relaxed font-medium shadow-sm",
                msg.sender === "bot"
                  ? "bg-white/10 dark:bg-slate-900/10 text-white rounded-tl-none border border-white/10"
                  : "bg-[#1800ad] text-white rounded-tr-none shadow-[#1800ad]/20"
              )}>
                {msg.text}
              </div>
              <p className={cn("text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter", msg.sender === "user" ? "text-right" : "")}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 dark:bg-slate-900/10 border border-white/10">
              <Bot className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="bg-white/10 dark:bg-slate-900/10 text-white px-4 py-3 rounded-[1rem] rounded-tl-none border border-white/10 text-[10px] italic">
              Bot sedang mengetik...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {/* Penyesuaian: Mengurangi padding (p-8 -> p-5) */}
      <div className="p-5 bg-white/5 dark:bg-slate-900/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Mohon tunggu respon bot..." : "Ketik pesan untuk mencoba bot..."}
            // Penyesuaian: Padding vertikal (py-5 -> py-3.5) dan radius (2xl -> xl), warna ring -> #1800ad
            className="w-full pl-5 pr-14 py-3.5 rounded-xl bg-white/10 dark:bg-slate-900/10 border border-white/10 focus:ring-2 focus:ring-[#1800ad]/30 outline-none text-white text-sm font-medium placeholder:text-slate-500 dark:text-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            // Warna: orange -> #1800ad, Padding p-3.5 -> p-2.5
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 bg-[#1800ad] text-white rounded-lg shadow-xl shadow-[#1800ad]/30 hover:scale-105 active:scale-95 transition-all disabled:grayscale disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};