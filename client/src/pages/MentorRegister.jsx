import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HeartPulse, Mail, Lock, User, AlertCircle, ArrowRight, BookOpen, Star } from "lucide-react";

export default function MentorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specializations: "",
    experienceYears: "",
    bio: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { mentorRegister } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const parsedData = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears) || 0,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean)
      };
      
      await mentorRegister(parsedData);
      setTimeout(() => navigate("/mentor-dashboard"), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 relative pt-12 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-secondary-500 to-indigo-400 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-secondary-500/30">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-3xl font-bold text-text-900">Become a Mentor</h2>
          <p className="text-text-500 mt-2 max-w-md mx-auto">Join our ecosystem of verified professionals and help make a difference in mental wellness.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl flex items-start gap-3 text-danger-600 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Col 1 */}
          <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Full Name / Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Professional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all"
                    placeholder="jane@clinic.com"
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
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Specializations (comma separated)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                    <Star size={18} />
                  </div>
                  <input
                    type="text"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all"
                    placeholder="Anxiety, CBT, Stress Coaching"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Years of Experience</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-400">
                    <BookOpen size={18} />
                  </div>
                  <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5 ml-1">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition-all resize-none"
                  placeholder="Tell your future patients about your approach..."
                  rows="3"
                ></textarea>
              </div>
          </div>

          <div className="col-span-1 md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-secondary-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-secondary-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Mentor Application <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-text-500">
          <p>Already a mentor? <Link to="/mentor-login" className="text-secondary-600 font-semibold hover:underline">Sign in here</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
