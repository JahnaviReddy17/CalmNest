import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Circle, Clock, Award } from "lucide-react";

export default function MyModules() {
  const { user } = useAuth();
  const [progressDocs, setProgressDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await api.get("/modules/user");
      setProgressDocs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async (progressId, currentStatus) => {
    try {
      await api.put(`/modules/user/complete/${progressId}`, {
        status: !currentStatus
      });
      fetchModules(); // Refresh state
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading your wellness journey...</div>;

  const completedCount = progressDocs.filter(p => p.completionStatus).length;
  const totalCount = progressDocs.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="w-full">
      <div className="mb-8 p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Your Assigned Modules</h1>
          <p className="text-indigo-100 max-w-lg">Complete these personalized resources assigned by your mentor to advance your wellness journey.</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[200px] text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-indigo-100 mb-1">Completion Rate</div>
          <div className="text-4xl font-black mb-2 flex items-baseline justify-center gap-1">
            {progressPct}<span className="text-lg opacity-70">%</span>
          </div>
          <div className="w-full bg-indigo-900/40 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No Modules Assigned Yet</h3>
            <p className="text-slate-500 mt-2">When your mentor assigns you a wellness module, it will appear here.</p>
          </div>
        ) : (
          progressDocs.map(doc => {
            const mod = doc.moduleId;
            if (!mod) return null; // Defensive check
            const mentorName = mod.mentorId?.name || "Your Mentor";

            return (
              <motion.div 
                key={doc._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden group ${
                  doc.completionStatus 
                    ? "border-emerald-200 shadow-emerald-500/5 bg-emerald-50/10" 
                    : "border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-indigo-500/10"
                }`}
              >
                {doc.completionStatus && (
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl z-0 pointer-events-none"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wider">{mod.type}</span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <Clock size={14} /> {mod.recommendedDuration || 10}m
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight">{mod.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                    {mod.description}
                  </p>
                  
                  <div className="text-xs text-indigo-600 font-semibold mb-6 flex items-center gap-1.5 bg-indigo-50 w-max px-3 py-1.5 rounded-full">
                    <Award size={14}/> Assigned by {mentorName}
                  </div>

                  <button 
                    onClick={() => toggleCompletion(doc._id, doc.completionStatus)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] ${
                      doc.completionStatus 
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    {doc.completionStatus ? (
                      <><CheckCircle2 size={20} className="text-emerald-600" /> Completed</>
                    ) : (
                      <><Circle size={20} className="opacity-70" /> Mark as Complete</>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
