import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Activity, FileWarning, Calendar, ArrowRight, ShieldAlert, HeartPulse, User } from "lucide-react";
import { Line } from "react-chartjs-2";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/mentor-dashboard/overview");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "mentor") fetchDashboard();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Mentor Portal...</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 6, display: false },
      x: { display: false }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome, {user.name}</h1>
        <p className="text-slate-500">Here's your patient overview for today.</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Assigned Users", value: data?.stats.totalAssigned || 0, icon: <Users size={24} />, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Pending Requests", value: data?.stats.pendingRequests || 0, icon: <Activity size={24} />, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Crisis Alerts", value: data?.stats.crisisAlertsCount || 0, icon: <FileWarning size={24} />, color: "text-red-500", bg: "bg-red-50" },
          { label: "Today's Sessions", value: data?.stats.todaySessions || 0, icon: <Calendar size={24} />, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((card, idx) => (
          <motion.div variants={itemVariants} key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Requests Section */}
      {data?.pendingRequests?.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8 bg-orange-50 border border-orange-100 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-orange-800 font-bold mb-4">
            <Activity size={20} /> New Mentorship Requests ({data.pendingRequests.length})
          </div>
          <div className="space-y-3">
            {data.pendingRequests.map(req => (
               <div key={req._id} className="flex flex-wrap items-center justify-between p-4 bg-white/60 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><User size={18} className="text-slate-500" /></div>
                   <div>
                     <p className="font-semibold text-slate-800">{req.userId?.isAnonymous ? 'Anonymous User' : req.userId?.name || 'Unknown'}</p>
                     <p className="text-xs text-slate-500">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={async () => {
                       await api.put(`/mentor/accept/${req._id}`);
                       window.location.reload();
                     }} 
                     className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg text-sm hover:bg-orange-600 transition-colors"
                   >
                     Accept
                   </button>
                   <button onClick={async () => {
                       await api.put(`/mentor/decline/${req._id}`);
                       window.location.reload();
                     }} 
                     className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-300 transition-colors"
                   >
                     Decline
                   </button>
                 </div>
               </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Assigned Users Grid */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Users size={24} className="text-indigo-500" /> Assigned Patients
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data?.assignedUsers?.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No patients assigned yet.</p>
            <p className="text-slate-400 text-sm mt-1">When users request you, they will appear here.</p>
          </div>
        ) : (
          data?.assignedUsers?.map((patient) => {
            const chartData = {
              labels: patient.moods?.map(m => m.timestamp) || [],
              datasets: [{
                data: patient.moods?.map(m => m.mood) || [],
                borderColor: '#6366f1',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
              }]
            };

            return (
              <motion.div variants={itemVariants} key={patient._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                {patient.activeCrisis && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-bl-full opacity-10 blur-xl"></div>
                )}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{patient.isAnonymous ? "Anonymous User" : patient.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                        Risk: <span className={patient.riskLevel === 'high' || patient.riskLevel === 'critical' ? 'text-red-500' : patient.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'}>{patient.riskLevel || 'Low'}</span>
                      </p>
                    </div>
                  </div>
                  {patient.activeCrisis && (
                    <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                      <ShieldAlert size={12} /> Critical
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Recent Mood Trend</span>
                    <span className="font-semibold text-slate-700">{patient.latestMood ? `${patient.latestMood.mood}/5` : 'N/A'}</span>
                  </div>
                  <div className="h-16 w-full">
                    {patient.moods?.length > 1 ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">Not enough data</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 relative z-10">
                  <Link to={`/mentor-chat/${patient._id}`} className="flex-1 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-center hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Message
                  </Link>
                  <Link to={`/mentor-patient/${patient._id}`} className="py-3 px-4 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-center hover:bg-slate-50 transition-colors tooltip" title="View Full Profile">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
