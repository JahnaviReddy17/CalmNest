import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { io } from "socket.io-client";
import { Send, User as UserIcon, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function MentorChat() {
  const { user } = useAuth();
  const { mentorId, userId } = useParams(); // Depending on route
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Logic to determine identities based on role
  const isMentorApp = user?.role === "mentor";
  const activeUserId = isMentorApp ? userId : user?.id;
  const activeMentorId = isMentorApp ? user?.id : mentorId;
  const roomId = `${activeUserId}-${activeMentorId}`;

  useEffect(() => {
    if (!activeUserId || !activeMentorId) return;

    // Connect socket
    socketRef.current = io("http://localhost:5000");
    
    socketRef.current.emit("join-mentor-chat", { roomId });

    socketRef.current.on("new-mentor-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Fetch history
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/mentor/chat/${activeUserId}/${activeMentorId}`);
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();

    return () => {
      socketRef.current.disconnect();
    };
  }, [activeUserId, activeMentorId, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("mentor-message", {
      roomId,
      message: newMessage,
      senderId: user?.id,
      userId: activeUserId,
      mentorId: activeMentorId
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200">
            {isMentorApp ? <UserIcon size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isMentorApp ? "Patient Session" : "Mentor Session"}
            </h2>
            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Secure & Encrypted
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?.id;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg._id || idx} 
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                <p className="text-[15px] leading-relaxed break-words">{msg.text || msg.message}</p>
                <div className={`text-[10px] mt-2 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
            placeholder="Type your message securely..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl px-6 py-4 font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            Send <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
