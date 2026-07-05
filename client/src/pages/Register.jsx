import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, User, Mail, Lock, AlertCircle, ArrowRight, HeartPulse, Briefcase, Award } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, mentorRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (role === "mentor") {
        await mentorRegister({
          name, 
          email, 
          password, 
          specializations: specializations.split(',').map(s => s.trim()), 
          experienceYears: Number(experienceYears)
        });
        setTimeout(() => navigate("/mentor-dashboard"), 100);
      } else {
        await register(name, email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 shadow-2xl">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto ${role === 'mentor' ? 'bg-secondary-100 text-secondary-600' : 'bg-primary-100 text-primary-600'}`}>
            {role === 'mentor' ? <HeartPulse size={32} /> : <UserPlus size={32} />}
          </div>
          
          <h2 className="text-3xl font-extrabold text-text-900 text-center mb-2 tracking-tight">Create Account</h2>
          <p className="text-center text-text-500 mb-6">Join Calm Nest and take the first step towards better mental wellness.</p>

          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8 relative">
            <button
              type="button"
              onClick={() => { setRole("user"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${role === "user" ? "text-primary-700" : "text-slate-500 hover:text-slate-700"}`}
            >
              <User size={18} /> User
            </button>
            <button
              type="button"
              onClick={() => { setRole("mentor"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${role === "mentor" ? "text-secondary-700" : "text-slate-500 hover:text-slate-700"}`}
            >
              <HeartPulse size={18} /> Mentor
            </button>
            <motion.div 
               layoutId="signupType"
               initial={false}
               className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-sm ${role === 'mentor' ? 'right-1.5' : 'left-1.5'}`}
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3 mb-6 border border-danger-100 font-medium text-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400 group-focus-within:text-primary-500 transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-text-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all placeholder:text-text-400 font-medium" 
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400 group-focus-within:text-primary-500 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-text-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all placeholder:text-text-400 font-medium" 
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400 group-focus-within:text-primary-500 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="Password (min 6 chars)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6} 
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-text-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all placeholder:text-text-400 font-medium" 
              />
            </div>

            <AnimatePresence>
              {role === "mentor" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400 group-focus-within:text-secondary-500 transition-colors">
                      <Briefcase size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Specializations (comma separated)" 
                      value={specializations} 
                      onChange={(e) => setSpecializations(e.target.value)} 
                      required={role === "mentor"}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-text-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary-400 outline-none transition-all placeholder:text-text-400 font-medium" 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400 group-focus-within:text-secondary-500 transition-colors">
                      <Award size={20} />
                    </div>
                    <input 
                      type="number" 
                      placeholder="Years of Experience" 
                      value={experienceYears} 
                      onChange={(e) => setExperienceYears(e.target.value)} 
                      required={role === "mentor"}
                      min="0"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-text-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary-400 outline-none transition-all placeholder:text-text-400 font-medium" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg ${role === 'mentor' ? 'bg-secondary-600 hover:bg-secondary-500 shadow-secondary-500/30' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/30'}`}
            >
              {loading ? "Creating Account..." : (
                <>
                  Sign Up <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-text-500 mt-8 font-medium">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
