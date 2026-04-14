import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, CheckCircle2, User, Star, Globe, Clock, ShieldCheck, Search, X } from "lucide-react";

export default function MentorsList() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (user?.isAnonymous) return;
    const fetchMentors = async () => {
      try {
        const { data } = await api.get("/mentor");
        setMentors(data);
      } catch (err) {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, [user]);

  const requestMentor = async (mentorId) => {
    setStatus("loading");
    try {
      await api.post("/mentor/request", { mentorId });
      setStatus("requested");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request mentor");
      setStatus("error");
    }
  };

  if (user?.isAnonymous) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/60 backdrop-blur-2xl border border-white p-12 rounded-3xl shadow-xl max-w-lg">
          <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
            <HeartPulse size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Account Required</h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">To ensure continuity of care, please create an account to connect with a mentor.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative min-h-[calc(100vh-8rem)] pb-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <HeartPulse size={36} className="text-primary-500" /> Professional Mentors
          </h1>
          <p className="text-lg text-slate-500 mt-2 max-w-2xl">Connect with certified mentors ready to listen, guide, and support you.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-medium text-sm">
          <ShieldCheck size={18} /> Verified Professionals Only
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : apiError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-xl border border-white/40 rounded-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-700">Service temporarily unavailable</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor, idx) => (
            <motion.div 
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-md flex flex-col hover:-translate-y-1 transition-all group overflow-hidden"
            >
              <div className="flex flex-col items-center text-center mb-5 relative z-10">
                <div className="relative mb-3">
                  <img src={mentor.photo} alt={mentor.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-slate-100" />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${mentor.status === 'online' ? 'bg-emerald-500' : mentor.status === 'busy' ? 'bg-yellow-500' : 'bg-slate-400'}`}></div>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{mentor.name}</h3>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-500 font-semibold mb-1">
                  <Star size={12} className="fill-current" /> {mentor.rating}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-2">{mentor.bio}</p>
              </div>

              <div className="space-y-2 mb-6 flex-grow border-t border-slate-100 pt-4">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <Search size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {mentor.specializations.map(s => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock size={14} className="text-emerald-400" />
                  <span>{mentor.experienceYears} Years Experience</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMentor(mentor)}
                className="w-full py-3 bg-white border-2 border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Choose Mentor
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Connection Modal Overlay */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl border border-white"
            >
              <button 
                onClick={() => { setSelectedMentor(null); setStatus("idle"); setError(""); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-4">
                <img src={selectedMentor.photo} alt={selectedMentor.name} className="w-24 h-24 rounded-3xl mx-auto mb-4 object-cover shadow-md" />
                <h3 className="text-2xl font-bold text-slate-900">{selectedMentor.name}</h3>
                <p className="text-slate-500 text-sm mt-1">Starting a secure, private session.</p>
              </div>

              {status === "idle" && (
                <button 
                  onClick={() => requestMentor(selectedMentor._id)} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
                >
                  Send Request
                </button>
              )}

              {status === "loading" && (
                <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div> Sending...
                </div>
              )}

              {status === "requested" && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-emerald-50 text-emerald-700 py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold border border-emerald-200">
                  <CheckCircle2 size={20} /> Request Sent! They will accept shortly.
                </motion.div>
              )}

              {status === "error" && (
                <div className="text-red-500 text-sm font-semibold text-center mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  {error}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
