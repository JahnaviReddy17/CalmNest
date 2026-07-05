import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Send, ArrowLeft, MessageCircle, ShieldAlert, ArrowRight } from "lucide-react";

const TOPICS = [
  { name: "Anxiety", desc: "Share strategies for coping with anxiety and panic." },
  { name: "Loneliness", desc: "Connect with others who understand isolation." },
  { name: "School Stress", desc: "Talk about academic pressure and expectations." },
  { name: "Family Issues", desc: "Discuss navigating difficult family dynamics." },
  { name: "Self-Esteem", desc: "Build confidence and self-worth together." },
  { name: "General", desc: "A safe space for any mental wellness topic." }
];

export default function SafeCircle() {
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [members, setMembers] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUsers]);

  useEffect(() => {
    if (!topic) return;
    const socket = io();
    socketRef.current = socket;
    
    // Join topic room
    socket.emit("join-safe-circle", { topic, userId: user?.id || "anon", name: user?.name || "Anonymous" });
    
    socket.on("circle-update", (data) => setMembers(data.members));
    
    socket.on("previous-messages", (pastMsgs) => {
      // Map history correctly ensuring name/id mapping
      const mapped = pastMsgs.map(m => ({
        ...m,
        userId: m.userId
      }));
      setMessages(mapped);
    });

    socket.on("new-circle-message", (msg) => setMessages((prev) => [...prev, msg]));
    
    socket.on("user-typing", ({ user }) => {
      setTypingUsers(prev => {
        if (!prev.includes(user)) return [...prev, user];
        return prev;
      });
    });

    socket.on("user-stopped-typing", () => {
      // Simplification: clear all for the demo. In production, track specific users.
      setTypingUsers([]);
    });

    return () => socket.disconnect();
  }, [topic, user]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit("typing-start", { topic, name: user?.name, userId: user?.id || "anon" });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("typing-stop", { topic });
      }, 1500);
    }
  };

  const send = () => {
    if (!input.trim()) return;
    socketRef.current?.emit("circle-message", { topic, message: input.trim(), userId: user?.id || "anon", name: user?.name });
    setInput("");
    socketRef.current?.emit("typing-stop", { topic });
  };

  const isOwnMessage = (msgUser) => {
    const currentName = user?.name || (user?.id ? user.id.slice(0, 8) + "..." : "Anonymous");
    return msgUser === currentName;
  };

  if (!topic) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-success-100 rounded-full text-success-600 mb-2 shadow-sm">
            <Users size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-text-900 tracking-tight">Safe Circle</h1>
          <p className="text-xl text-text-500 max-w-2xl mx-auto">Join an anonymous peer support group by topic to share, listen, and grow together without judgment.</p>
        </div>

        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm mb-8">
          <ShieldAlert className="text-primary-500 mt-1 flex-shrink-0" size={24} />
          <p className="text-sm text-primary-800 font-medium">
            Remember: This is a safe space constraint. By joining a circle, you agree to treat everyone with respect and kindness. Trolls or abusive language will result in an immediate ban.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((t, idx) => (
            <motion.button 
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setTopic(t.name)} 
              className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between h-40 shadow-sm"
            >
              <div>
                <h3 className="text-xl font-bold text-text-800 group-hover:text-primary-600 transition-colors flex items-center justify-between">
                  {t.name}
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-500" />
                </h3>
                <p className="text-text-500 text-sm mt-2">{t.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto relative overflow-hidden bg-white/40 backdrop-blur-3xl rounded-3xl border border-white/60 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-text-100 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setTopic(null); setMessages([]); }} 
            className="p-2 hover:bg-white rounded-xl transition-colors text-text-500 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-primary-500" />
              {topic}
            </h2>
            <p className="text-xs text-text-500 font-medium">{members} member{members !== 1 && "s"} online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
          </span>
          <span className="text-sm font-semibold text-text-600">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-400 space-y-4">
            <Users size={48} className="opacity-50" />
            <p className="text-lg">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const ownMsg = isOwnMessage(m.userId);
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex flex-col ${ownMsg ? "items-end" : "items-start"}`}
              >
                {!ownMsg && <span className="text-[11px] text-text-400 font-medium ml-2 mb-1">{m.userId}</span>}
                <div className={`
                  max-w-[75%] px-5 py-3 rounded-2xl shadow-sm
                  ${ownMsg 
                    ? "bg-primary-500 text-white rounded-tr-sm" 
                    : "bg-white border border-text-100 text-text-800 rounded-tl-sm"
                  }
                `}>
                  <p className="text-[15px] leading-relaxed break-words">{m.message}</p>
                </div>
              </motion.div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 text-text-400 text-sm italic py-2 pl-2"
            >
              <div className="flex gap-1 bg-white px-3 py-2 rounded-full border border-text-100 shadow-sm">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              Someone is typing...
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-text-100">
        <div className="relative flex items-center">
          <input 
            value={input} 
            onChange={handleTyping} 
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message anonymously..." 
            className="flex-1 px-6 py-4 bg-white border border-text-200 rounded-full outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all shadow-sm text-text-800"
          />
          <button 
            onClick={send} 
            disabled={!input.trim()}
            className="absolute right-2 p-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:bg-text-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Send size={18} className="translate-x-px -translate-y-px" />
          </button>
        </div>
      </div>
    </div>
  );
}
