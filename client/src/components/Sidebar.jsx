import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, SmilePlus, MessageSquare, ShieldCheck, HeartPulse, LogOut, FileText, UserCircle, Activity, Award, Feather, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import NotificationBell from "./NotificationBell";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
    { to: "/mood", icon: <SmilePlus size={22} />, label: "Mood Check-in" },
    { to: "/chat", icon: <MessageSquare size={22} />, label: "AI Support" },
    { to: "/safe-circle", icon: <ShieldCheck size={22} />, label: "Safe Circle" },
  ];

  if (!user.isAnonymous) {
    navItems.push(
      { to: "/mentors", icon: <HeartPulse size={22} />, label: "Mentorship" },
      { to: "/my-modules", icon: <BookOpen size={22} />, label: "My Modules" },
      { to: "/wellness-activities", icon: <Activity size={22} />, label: "Activities" },
      { to: "/achievements", icon: <Award size={22} />, label: "Achievements" },
      { to: "/relax", icon: <Feather size={22} />, label: "Relax Mode" },
      { to: "/insights", icon: <FileText size={22} />, label: "Insights" }
    );
  }

  if (user.role === "admin") {
    navItems.push({ to: "/ngo", icon: <UserCircle size={22} />, label: "NGO Panel" });
  }

  return (
    <div className="w-64 h-screen max-h-screen bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-[4px_0_24px_rgb(0,0,0,0.02)] fixed top-0 left-0 z-40 flex flex-col pt-8 pb-6 px-4">
      <Link to="/dashboard" className="flex items-center gap-3 px-4 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-400 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/30">
          🛡️
        </div>
        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-text-900 to-text-600 tracking-tight flex-1">Calm Nest</span>
        {!user.isAnonymous && <NotificationBell />}
      </Link>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}>
              <div
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? "text-primary-700 font-semibold shadow-sm"
                    : "text-text-500 hover:text-text-800 hover:bg-white/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-primary-50 border border-primary-100/50 rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <span className={`transition-colors duration-300 ${isActive ? "text-primary-600" : "group-hover:text-primary-500"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-4 pt-6 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full py-3.5 px-4 text-danger-500 hover:bg-danger-50 rounded-2xl transition-colors font-medium group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
