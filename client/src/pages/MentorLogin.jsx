import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HeartPulse, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function MentorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { mentorLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await mentorLogin(email, password);
      // Wait a moment for context to update
      setTimeout(() => navigate("/mentor-dashboard"), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-secondary-400 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-900">Mentor Portal</h2>
          <p className="text-text-500 text-sm mt-1">Sign in to support your patients</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl flex items-start gap-3 text-danger-600 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Professional Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="dr.jane@clinic.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-text-500">
          <p>Not a registered mentor? <Link to="/mentor-signup" className="text-primary-600 font-semibold hover:underline">Apply here</Link></p>
        </div>
        
        <div className="mt-8 flex justify-center">
            <Link to="/login" className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
              <ShieldCheck size={14} /> Back to User Portal
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
