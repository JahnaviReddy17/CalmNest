import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import { User, Activity, AlertCircle, ArrowLeft, BookOpen, Clock, CalendarHeart } from "lucide-react";
import { Line } from "react-chartjs-2";

export default function MentorPatientProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/mentor-patient/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Patient File...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Patient Not Found or Access Denied</div>;

  const { profile, analytics } = data;
  const isAnon = profile.isAnonymous;
  const displayName = isAnon ? `Anonymous Patient (${profile.anonymousId.substring(0,8)})` : profile.name;

  const chartData = {
    labels: analytics.moods?.map(m => new Date(m.timestamp).toLocaleDateString()) || [],
    datasets: [{
      label: "Mood Over Time",
      data: analytics.moods?.map(m => m.mood) || [],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 6 } }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Link to="/mentor-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        {profile.riskLevel === 'high' || profile.riskLevel === 'critical' ? (
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-bl-full opacity-10 blur-xl"></div>
        ) : null}

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
            <User size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">{displayName}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full font-bold tracking-wider ${
                profile.riskLevel === 'high' || profile.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                RISK: {profile.riskLevel?.toUpperCase() || 'LOW'}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold tracking-wider">
                JOINED: {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Link to={`/mentor-chat/${profile._id}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors w-full md:w-auto text-center relative z-10">
          Open Secure Chat
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mood Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={22} className="text-purple-500" /> 14-Day Mood Trajectory
            </h3>
            <div className="h-64 w-full">
               {analytics.moods?.length > 1 ? (
                 <Line data={chartData} options={chartOptions} />
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">Not enough mood data collected yet.</div>
               )}
            </div>
          </div>

          {/* assigned Modules */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={22} className="text-blue-500" /> Prescribed Modules
              </h3>
              <Link to="/mentor-modules" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Assign New +</Link>
            </div>
            
            <div className="space-y-4">
               {analytics.modules.length === 0 ? (
                 <p className="text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">No modules assigned to this patient.</p>
               ) : (
                 analytics.modules.map(mod => (
                    <div key={mod._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-colors">
                       <div className="mb-3 sm:mb-0">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-center">{mod.moduleId?.type || 'Module'}</span>
                           <span className="font-bold text-slate-800">{mod.moduleId?.title || 'Unknown Title'}</span>
                         </div>
                         <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                           <Clock size={12}/> {mod.moduleId?.recommendedDuration || 10}m
                         </div>
                       </div>
                       
                       <div>
                         {mod.completionStatus ? (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-1">
                              Completed on {new Date(mod.completedAt).toLocaleDateString()}
                            </span>
                         ) : (
                            <span className="px-4 py-2 bg-slate-200 text-slate-600 text-sm font-bold rounded-xl">Pending Completion</span>
                         )}
                       </div>
                    </div>
                 ))
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Alerts */}
        <div className="space-y-8">
          
          {/* Crisis Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle size={22} className="text-red-500" /> Recent Crisis Alerts
            </h3>
            <div className="space-y-3">
              {analytics.crisisAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl text-center">No crisis alerts recorded.</p>
              ) : (
                analytics.crisisAlerts.map(alert => (
                  <div key={alert._id} className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-sm font-bold text-red-800 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {alert.issueContent || "High Stress Event"}
                    </p>
                    <p className="text-xs text-red-500 font-semibold mt-2 ml-6">
                      Triggered: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CalendarHeart size={22} className="text-pink-500" /> Platform Activity
            </h3>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
              {analytics.activities.length === 0 ? (
                <p className="text-slate-500 text-sm pl-4">No recent activity found.</p>
              ) : (
                analytics.activities.map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                    <p className="text-sm font-semibold text-slate-800">{act.activityType}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
