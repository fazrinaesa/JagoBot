import { Send, Bot, User, RotateCcw, Info, Sparkles, Zap } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: string;
}

const QUICK_START = [
  "Berapa harga produk terlaris?",
  "Apakah bisa kirim luar kota?",
  "Jam operasional toko?",
];

export const ChatbotPlayground = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya asisten JagoBot Anda. Ada yang bisa saya bantu hari ini?",
      sender: "bot",
      timestamp: "10:00",
    },
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

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    const storedActiveBotId = localStorage.getItem("activeBotId");
    const activeBotId = storedActiveBotId ? Number(storedActiveBotId) : null;

    if (!activeBotId) {
      console.error("❌ activeBotId tidak ditemukan di localStorage");
      alert("Sesi tidak valid, silakan login ulang.");
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const requestBody = {
        botId: activeBotId,
        customerName: storedUser.nama_lengkap || storedUser.nama_toko || "User Jago",
        message: currentInput,
      };

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.status === "success") {
        const botResponse = result.data.aiResponse || result.data.jawaban || "Bot tidak memberikan respon.";

        const botMsg: Message = {
          id: Date.now() + 1,
          text: botResponse,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("❌ [Playground] Gagal mengirim pesan:", error);
      const errorMsg: Message = {
        id: Date.now() + 2,
        text: "Maaf, terjadi gangguan koneksi ke otak bot. Silakan coba lagi.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = (text: string) => {
    if (isLoading) return;
    setInput(text);
  };

  return (
    <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900/60">
      {/* ── Header ala platform chatbot profesional ── */}
      <div className="relative flex items-center justify-between overflow-hidden border-b border-border-subtle bg-gradient-to-r from-brand-blue via-[#132d52] to-brand-navy px-6 py-4 dark:border-neutral-800 dark:from-brand-blue dark:to-brand-navy">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-accent-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-36 w-36 rounded-full bg-accent-violet/20 blur-3xl" />

        <div className="relative flex items-center gap-3.5">
          {/* Avatar bot dengan ring status */}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-soft ring-2 ring-white/20">
              <Bot className="h-5.5 w-5.5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-brand-navy bg-accent-green" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold tracking-tight text-white">JagoBot Playground</h3>
              <Sparkles className="h-3.5 w-3.5 text-accent-blue-light" />
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Online · Balas instan
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 1,
                text: "Halo! Saya asisten JagoBot Anda. Ada yang bisa saya bantu hari ini?",
                sender: "bot",
                timestamp: "10:00",
              },
            ])
          }
          className="relative flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-ring"
          title="Reset Percakapan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* ── Area pesan ── */}
      <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto bg-surface/70 px-6 py-6 dark:bg-neutral-950/40">
        {/* Info strip */}
        <div className="flex items-start gap-3 rounded-2xl border border-accent-blue/15 bg-accent-blue/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue dark:text-accent-blue-light" />
          <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            Respon di sini menggunakan data dari <strong className="font-semibold">Knowledge Base</strong> dan{" "}
            <strong className="font-semibold">Profil Bot</strong> yang telah Anda atur.
          </p>
        </div>

        {/* Quick start chips — tampil sebelum percakapan dimulai */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {QUICK_START.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickStart(q)}
                className="rounded-full border border-border-subtle bg-white px-3.5 py-2 text-[11px] font-semibold text-neutral-600 shadow-soft transition-all hover:text-accent-blue hover:shadow-hover-blue focus-ring dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-accent-blue-light"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2.5",
              msg.sender === "user" ? "flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase shadow-soft",
                msg.sender === "bot"
                  ? "bg-gradient-to-br from-accent-blue to-accent-violet text-white"
                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
              )}
            >
              {msg.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            <div className={cn("max-w-[78%] space-y-1", msg.sender === "user" && "items-end text-right")}>
              {/* Label pengirim */}
              <p className={cn("px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400", msg.sender === "user" && "text-right")}>
                {msg.sender === "bot" ? "JagoBot" : "Anda"}
              </p>

              <div
                className={cn(
                  "px-4 py-3 text-xs font-medium leading-relaxed shadow-soft",
                  msg.sender === "bot"
                    ? // Bubble bot: permukaan terang dengan ekor kiri
                      "rounded-2xl rounded-bl-md border border-border-subtle bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    : // Bubble user: gradien brand dengan ekor kanan
                      "rounded-2xl rounded-br-md bg-gradient-to-br from-accent-blue to-accent-violet text-white"
                )}
              >
                {msg.text}
              </div>

              <p className={cn("px-1 text-[10px] font-medium text-neutral-400", msg.sender === "user" && "text-right")}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator dengan dots */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-soft">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">JagoBot</p>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border-subtle bg-white px-4 py-3.5 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input toolbar ── */}
      <div className="border-t border-border-subtle bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Bot sedang memproses..." : "Tulis pesan untuk menguji bot Anda..."}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 py-3.5 pl-4 pr-12 text-sm font-medium text-neutral-800 placeholder:text-neutral-400 outline-none transition-all focus:border-accent-blue/60 focus:bg-white focus:ring-4 focus:ring-accent-blue/10 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-neutral-300">
              Enter ↵
            </span>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet text-white shadow-lift transition-all hover:scale-105 active:scale-95 focus-ring disabled:scale-100 disabled:opacity-40 disabled:grayscale"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-neutral-400">
          <Zap className="h-3 w-3 text-accent-green" />
          Didukung oleh Knowledge Base Anda · JagoBot dapat melakukan kesalahan
        </p>
      </div>
    </div>
  );
};
