import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, FileText, CheckCircle2, UserCheck, X } from "lucide-react";

export default function MentorModules() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newModTitle, setNewModTitle] = useState("");
  const [newModDesc, setNewModDesc] = useState("");
  const [newModType, setNewModType] = useState("Exercise");
  
  const [assigningModule, setAssigningModule] = useState(null);
  const [patients, setPatients] = useState([]); // Fetch mentor's assigned patients to select from
  const [selectedPatients, setSelectedPatients] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const modRes = await api.get("/modules/mentor");
      setModules(modRes.data);
      
      const patRes = await api.get("/mentor-dashboard/overview");
      setPatients(patRes.data.assignedUsers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/modules/mentor/create", {
        title: newModTitle,
        description: newModDesc,
        type: newModType,
        recommendedDuration: 15
      });
      setIsCreating(false);
      setNewModTitle("");
      setNewModDesc("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (selectedPatients.length === 0) return;
    try {
      await api.put(`/modules/mentor/assign/${assigningModule._id}`, {
        userIds: selectedPatients
      });
      setAssigningModule(null);
      setSelectedPatients([]);
      fetchData();
    } catch (err) {
      console.error("Assign Error", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Modules...</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <BookOpen size={30} className="text-indigo-500" /> Module Library
          </h1>
          <p className="text-slate-500">Create and assign wellness resources to your patients.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all font-sans"
        >
          <Plus size={20} /> Create Module
        </button>
      </div>

      {isCreating && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Draft New Resource</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Module Title</label>
                <input required value={newModTitle} onChange={e => setNewModTitle(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 5-Minute Box Breathing" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Resource Type</label>
                <select value={newModType} onChange={e => setNewModType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Exercise</option>
                  <option>Course</option>
                  <option>Reading</option>
                  <option>Video</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Description</label>
              <textarea required value={newModDesc} onChange={e => setNewModDesc(e.target.value)} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Explain how the user should engage with this material..."></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Save Resource</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No modules created yet.</p>
          </div>
        ) : (
          modules.map(mod => (
            <div key={mod._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col group hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{mod.type}</span>
                 <span className="text-slate-400 text-sm font-medium">{mod.assignedUsers.length} Enrolled</span>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">{mod.title}</h3>
              <p className="text-slate-500 text-sm flex-1 mb-6 line-clamp-3 leading-relaxed">{mod.description}</p>
              
              <button 
                onClick={() => setAssigningModule(mod)}
                className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck size={18} /> Assign to Patients
              </button>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigningModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
              <button onClick={() => setAssigningModule(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full"><X size={20} /></button>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Assign Resource</h3>
              <p className="text-slate-500 mb-6 border-b border-slate-100 pb-4">Assigning <strong>{assigningModule.title}</strong> to specific patients.</p>

              <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2">
                {patients.map(p => {
                  const isAssigned = assigningModule.assignedUsers.some(u => u._id === p._id);
                  const isSelected = selectedPatients.includes(p._id);
                  
                  return (
                    <div 
                      key={p._id} 
                      onClick={() => !isAssigned && setSelectedPatients(prev => isSelected ? prev.filter(id => id !== p._id) : [...prev, p._id])}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer ${
                        isAssigned ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" :
                        isSelected ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="font-semibold text-slate-800">{p.isAnonymous ? "Anonymous User" : p.name}</span>
                      {isAssigned ? (
                        <span className="text-emerald-600 font-medium text-xs flex items-center gap-1"><CheckCircle2 size={14}/> Assigned</span>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"}`}>
                          {isSelected && <CheckCircle2 size={12} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleAssign}
                disabled={selectedPatients.length === 0}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Confirm Assignment ({selectedPatients.length})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
