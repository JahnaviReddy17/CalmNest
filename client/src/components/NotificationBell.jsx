import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();

    const socket = io();
    socket.emit("join-user", { userId: user.id });

    socket.on("newNotification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.isAnonymous) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-text-600 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl overflow-hidden z-50 transform origin-top-right"
          >
            <div className="p-4 border-b border-gray-100 bg-white/50 flex justify-between items-center">
              <h3 className="font-bold text-text-800">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
              {notifications.length === 0 ? (
                 <div className="p-6 text-center text-text-400 text-sm">
                   <Bell size={24} className="mx-auto mb-2 opacity-20" />
                   You're all caught up!
                 </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id} 
                    onClick={() => markAsRead(n._id)}
                    className={`p-3 rounded-2xl mb-1 cursor-pointer transition-all ${n.readStatus ? 'bg-transparent hover:bg-gray-50' : 'bg-primary-50/50 hover:bg-primary-50 border border-primary-100/50'}`}
                  >
                    <p className={`text-sm ${n.readStatus ? 'text-text-600' : 'text-text-800 font-medium'}`}>{n.message}</p>
                    <span className="text-[10px] text-text-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
