import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Bot, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";

export default function AIChat({ onCrisis }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/chat/ai", {
        message: msg,
        chatId,
        anonymousId: user?.isAnonymous ? user.id : undefined,
      });
      setChatId(data.chatId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.crisis) onCrisis?.(data.crisis);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Service temporarily unavailable" }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto pb-4">
      <div className="flex items-center justify-between mb-6 px-4 py-4 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-inner">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-900 tracking-tight flex items-center gap-2">
              AI Companion
              <span className="bg-success-100 text-success-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span> Online
              </span>
            </h1>
            <p className="text-text-500 text-sm">Always here to listen. Completely confidential.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-text-50 px-3 py-1.5 rounded-xl border border-text-100 text-text-600 text-sm font-medium">
          <ShieldCheck size={16} className="text-primary-500" />
          End-to-End Encrypted
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/40 p-6 shadow-inner scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-70">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-700 mb-2">How are you feeling today?</h2>
            <p className="text-text-500">I am here to support you. You can talk to me about anything that's on your mind.</p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed relative ${
                m.role === "user" 
                  ? "bg-primary-600 text-white rounded-br-sm shadow-md shadow-primary-500/20" 
                  : "bg-white text-text-800 rounded-bl-sm shadow-sm border border-gray-100"
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-3xl border border-white/50 shadow-lg flex items-center gap-2">
        <button className="p-3 text-text-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors">
          <Mic size={22} />
        </button>
        <div className="w-px h-8 bg-gray-200"></div>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Share what's on your mind..." 
          className="flex-1 px-3 py-2 bg-transparent outline-none text-text-800 placeholder:text-text-400" 
        />
        <button 
          onClick={send} 
          disabled={loading || !input.trim()} 
          className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 disabled:opacity-50 disabled:bg-gray-300 transition-all duration-300 shadow-md shadow-primary-500/30 group"
        >
          <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
