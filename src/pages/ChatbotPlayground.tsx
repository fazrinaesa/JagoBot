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

    // 1. Ambil data user dari localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    // ✅ PENYESUAIAN: Mengambil botId secara fleksibel (mencoba key 'botId' atau 'id')
    // Berdasarkan skema Prisma mu, bot menggunakan field 'id'
    const activeBotId = storedUser.botId || storedUser.id;

    if (!activeBotId) {
      console.error("DEBUG: botId tidak ditemukan di localStorage", storedUser);
      alert("Sesi tidak valid, silakan login ulang.");
      return;
    }

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
      // 2. Fetch ke Backend API
      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: Number(activeBotId), // Pastikan dikirim sebagai Number sesuai skema Prisma
          customerName: storedUser.nama_lengkap || "User Jago",
          message: currentInput
        })
      });

      const result = await response.json();

      if (result.status === "success") {
        const botMsg: Message = {
          id: Date.now() + 1,
          text: result.data.jawaban,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Gagal mengirim pesan:", error);
      const errorMsg: Message = {
        id: Date.now() + 2,
        text: "Maaf, terjadi gangguan koneksi ke otak bot. Silakan coba lagi.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col max-w-4xl mx-auto bg-brand-blue rounded-[2.5rem] border border-white/5 shadow-2xl shadow-brand-blue/20 overflow-hidden">
      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <Bot className="text-white w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase tracking-tight">Uji Coba Bot</h3>
            <p className="text-[10px] text-emerald-400 font-black flex items-center gap-1 uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ id: 1, text: "Halo! Saya asisten JagoBot Anda. Ada yang bisa saya bantu hari ini?", sender: "bot", timestamp: "10:00" }])}
          className="p-3 text-slate-400 hover:text-white transition-colors bg-white/10 rounded-xl"
          title="Reset Percakapan"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-brand-blue/50">
        <div className="bg-white/5 p-5 rounded-2xl flex gap-4 mb-4 border border-white/10">
          <Info className="w-5 h-5 text-brand-orange shrink-0" />
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Gunakan area ini untuk mencoba bagaimana bot Anda merespon pertanyaan pelanggan. Respon di sini menggunakan data dari Knowledge Base dan Kepribadian yang telah Anda atur.
          </p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              msg.sender === "bot" ? "bg-white/10 text-brand-orange border border-white/10" : "bg-brand-orange text-white"
            )}>
              {msg.sender === "bot" ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div className="space-y-2">
              <div className={cn(
                "px-5 py-4 rounded-[1.5rem] text-sm leading-relaxed font-medium shadow-sm",
                msg.sender === "bot"
                  ? "bg-white/10 text-white rounded-tl-none border border-white/10"
                  : "bg-brand-orange text-white rounded-tr-none shadow-brand-orange/20"
              )}>
                {msg.text}
              </div>
              <p className={cn("text-[10px] font-black text-slate-500 uppercase tracking-tighter", msg.sender === "user" ? "text-right" : "")}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10">
              <Bot className="w-6 h-6 text-brand-orange animate-bounce" />
            </div>
            <div className="bg-white/10 text-white px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-white/10 text-xs italic">
              Bot sedang mengetik...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Mohon tunggu respon bot..." : "Ketik pesan untuk mencoba bot..."}
            className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white/10 border border-white/10 focus:ring-4 focus:ring-brand-orange/10 outline-none text-white font-medium placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3.5 bg-brand-orange text-white rounded-xl shadow-xl shadow-brand-orange/30 hover:scale-105 active:scale-95 transition-all disabled:grayscale disabled:scale-100"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};