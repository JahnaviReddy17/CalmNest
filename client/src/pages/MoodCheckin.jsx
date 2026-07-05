import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, HeartPulse } from "lucide-react";

const MOODS = [
  { value: 1, emoji: "😢", label: "Terrible", color: "text-danger-500", bg: "bg-danger-50 text-danger-600 border-danger-200" },
  { value: 2, emoji: "😔", label: "Bad", color: "text-orange-500", bg: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: 3, emoji: "😐", label: "Okay", color: "text-yellow-500", bg: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { value: 4, emoji: "🙂", label: "Good", color: "text-success-500", bg: "bg-success-50 text-success-600 border-success-200" },
  { value: 5, emoji: "😊", label: "Great", color: "text-primary-500", bg: "bg-primary-50 text-primary-600 border-primary-200" },
];

export default function MoodCheckin({ onCrisis }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await api.post("/mood", {
        mood: selected.value,
        emoji: selected.emoji,
        note,
        anonymousId: user?.isAnonymous ? user.id : undefined,
      });
      setSubmitted(true);
      if (data.crisis) onCrisis?.(data.crisis);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl rounded-3xl p-8 sm:p-12 border border-white/60 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-success-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-text-900 tracking-tight mb-3">How are you feeling?</h1>
                <p className="text-lg text-text-500">Take a deep breath and select the emotion that best fits your current state.</p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-between gap-4 mb-10">
                {MOODS.map((m) => (
                  <button 
                    key={m.value} 
                    onClick={() => setSelected(m)}
                    className={`flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 transition-all duration-300 relative group
                      ${selected?.value === m.value 
                        ? `${m.bg} shadow-md scale-105` 
                        : "bg-white border-transparent hover:border-text-200 hover:bg-gray-50 shadow-sm"
                      }
                    `}
                  >
                    <span className="text-5xl mb-2 group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className={`text-sm font-semibold ${selected?.value === m.value ? 'opacity-100' : 'text-text-500'}`}>{m.label}</span>
                  </button>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: selected ? 1 : 0.5, height: 'auto' }}
                className="mb-8"
              >
                <div className="relative">
                  <textarea 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    placeholder="Would you like to journal about why you feel this way? (Optional)" 
                    rows={4}
                    disabled={!selected}
                    className="w-full px-5 py-4 bg-white/50 backdrop-blur-sm border border-text-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none resize-none transition-all placeholder:text-text-400 text-text-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute bottom-3 right-3 text-text-400">
                    <Send size={18} className={note.length > 0 ? 'text-primary-500' : ''} />
                  </div>
                </div>
              </motion.div>

              <button 
                onClick={handleSubmit} 
                disabled={!selected || loading}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Check-in...
                  </div>
                ) : (
                  <>
                    Log Entry <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div 
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="text-8xl mb-6 drop-shadow-xl"
              >
                {selected.emoji}
              </motion.div>
              <h2 className="text-3xl font-extrabold text-text-900 mb-4 tracking-tight">Recorded Successfully!</h2>
              <p className="text-lg text-text-500 max-w-md mx-auto mb-10">
                Thank you for taking the time to check in with yourself. Every entry helps build your mental wellness picture.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => { setSubmitted(false); setSelected(null); setNote(""); }} 
                  className="px-8 py-3 bg-white border border-text-200 text-text-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  New Check-in
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  <HeartPulse size={18} /> Return Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
