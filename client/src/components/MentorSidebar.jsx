import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Users, MessageSquare, BookOpen, LogOut, FileText } from "lucide-react";
import { motion } from "framer-motion";
import NotificationBell from "./NotificationBell";

export default function MentorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== "mentor") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const navItems = [
    { to: "/mentor-dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
    { to: "/assigned-users", icon: <Users size={22} />, label: "My Patients" },
    { to: "/mentor-chats", icon: <MessageSquare size={22} />, label: "Messages" },
    { to: "/mentor-modules", icon: <BookOpen size={22} />, label: "Modules" },
  ];

  return (
    <div className="w-64 h-screen max-h-screen bg-slate-900 border-r border-slate-800 shadow-[4px_0_24px_rgb(0,0,0,0.5)] fixed top-0 left-0 z-40 flex flex-col pt-8 pb-6 px-4">
      <Link to="/mentor-dashboard" className="flex items-center gap-3 px-4 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary-500 to-indigo-500 flex items-center justify-center text-white text-xl shadow-lg shadow-secondary-500/30">
          🛡️
        </div>
        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex-1">Calm Nest Mentor</span>
        <NotificationBell />
      </Link>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to}>
              <div
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? "text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-bg-mentor"
                    className="absolute inset-0 bg-slate-800 border border-slate-700/50 rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <span className={`transition-colors duration-300 ${isActive ? "text-secondary-400" : "group-hover:text-secondary-400"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-4 pt-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full py-3.5 px-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors font-medium group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
