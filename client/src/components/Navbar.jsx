import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Proper logout with redirect
  const handleLogout = () => {
    logout();                 // clear auth state
    localStorage.clear();     // optional: clear everything
    navigate("/", { replace: true }); // ✅ redirect to home
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-brand-700">
          🛡️ Calm Nest
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4 text-sm">

          {/* ✅ Logged-in user */}
          {user && (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-brand-600">Dashboard</Link>
              <Link to="/mood" className="text-gray-600 hover:text-brand-600">Mood</Link>
              <Link to="/chat" className="text-gray-600 hover:text-brand-600">AI Chat</Link>
              <Link to="/safe-circle" className="text-gray-600 hover:text-brand-600">Safe Circle</Link>

              {!user.isAnonymous && (
                <>
                  <Link to="/mentors" className="text-gray-600 hover:text-brand-600">Mentor</Link>
                  <Link to="/insights" className="text-gray-600 hover:text-brand-600">Insights</Link>
                </>
              )}

              {user.role === "admin" && (
                <Link to="/ngo" className="text-gray-600 hover:text-brand-600">NGO Panel</Link>
              )}

              {/* Notifications */}
              {!user.isAnonymous && <NotificationBell />}

              {/* ✅ Logout */}
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 ml-4 font-medium"
              >
                Logout
              </button>
            </>
          )}

          {/* ❌ Not logged in */}
          {!user && (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg transition-all shadow-primary-500/30">Sign Up</Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}