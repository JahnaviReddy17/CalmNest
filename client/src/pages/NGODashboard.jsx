import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import api from "../services/api";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Users, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function NGODashboard() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: analyticsData } = await api.get("/analytics/dashboard");
        setData(analyticsData);
      } catch (err) {
        console.error("Failed fetching analytics:", err);
        setError(true);
      }
      
      try {
        const { data: alertsData } = await api.get("/crisis/alerts");
        setAlerts(alertsData || []);
      } catch (err) {
        console.error("Failed fetching alerts:", err);
        setError(true);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
        <AlertTriangle size={48} className="text-text-400 mb-4" />
        <h2 className="text-2xl font-bold text-text-700">Service temporarily unavailable</h2>
        <p className="text-text-500 mt-2">We are having trouble connecting to the analytics server.</p>
      </div>
    );
  }

  if (!data) return (
    <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  const moodChart = {
    labels: data.dailyMoods?.map((d) => d._id) || [],
    datasets: [{
      label: "Average Mood",
      data: data.dailyMoods?.map((d) => d.avg) || [],
      backgroundColor: "rgba(139, 92, 246, 0.7)",
      borderColor: "#8B5CF6",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const severityChart = {
    labels: data.severityCounts?.map((s) => s._id) || [],
    datasets: [{
      data: data.severityCounts?.map((s) => s.count) || [],
      backgroundColor: ["#FBBF24", "#F87171", "#DC2626", "#8B5CF6"],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const resolveAlert = async (id) => {
    try {
      await api.put(`/crisis/resolve/${id}`);
      setAlerts(alerts.map((a) => (a._id === id ? { ...a, resolved: true } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-text-900 tracking-tight flex items-center gap-3">
            <ShieldCheck size={36} className="text-primary-500" /> Admin & NGO Portal
          </h1>
          <p className="text-lg text-text-500 mt-2">Platform analytics, active alerts, and community health at a glance.</p>
        </div>
        <div className="px-5 py-2.5 bg-white border border-text-200 rounded-full text-sm font-semibold text-text-700 shadow-sm flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
          </span>
          System Online
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Users", value: data.activeUsers || 0, icon: <Users size={24} className="text-primary-500" />, bg: "bg-primary-50 border-primary-100" },
          { label: "Crisis Alerts", value: data.alertsCount || 0, icon: <AlertTriangle size={24} className="text-danger-500" />, bg: "bg-danger-50 border-danger-100" },
          { label: "Platform Stress", value: data.stressLevel?.toUpperCase() || "UNKNOWN", icon: <Activity size={24} className="text-yellow-500" />, bg: "bg-yellow-50 border-yellow-100" },
          { label: "Avg Mood Score", value: data.avgMoodScore || 0, icon: <TrendingUp size={24} className="text-success-500" />, bg: "bg-success-50 border-success-100" },
        ].map((s, i) => (
          <motion.div variants={itemVariants} key={i} className={`rounded-3xl p-6 border ${s.bg} flex flex-col justify-between shadow-sm`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">{s.icon}</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-text-900 mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-text-600 uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm">
          <h3 className="font-bold text-text-800 text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" /> Platform Mood Trends (30 Days)
          </h3>
          <div className="h-72 w-full">
            <Bar 
              data={moodChart} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 10, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm flex flex-col">
          <h3 className="font-bold text-text-800 text-lg mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-danger-500" /> Severity Breakdown
          </h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            {data.severityCounts?.length > 0 ? (
              <Doughnut 
                data={severityChart} 
                options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} 
              />
            ) : (
              <p className="text-text-400 font-medium">No alerts recorded.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Alerts Row */}
      <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-900 flex items-center gap-2">
            <AlertTriangle size={22} className="text-danger-500" /> Actionable Crisis Alerts
          </h2>
          <span className="bg-danger-100 text-danger-700 text-xs font-bold px-3 py-1 rounded-full">{alerts.filter(a => !a.resolved).length} Pending</span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
          {alerts.length === 0 ? (
            <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-text-200">
              <ShieldCheck size={32} className="mx-auto text-success-400 mb-2" />
              <p className="text-text-500 font-medium">All clear. No active alerts.</p>
            </div>
          ) : (
            alerts.slice(0, 15).map((a) => (
              <div key={a._id} className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border ${a.resolved ? "border-text-100 opacity-60" : "border-danger-100"} p-4 transition-all hover:shadow-md`}>
                <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${a.severity === "critical" ? "bg-danger-100 text-danger-600" : a.severity === "high" ? "bg-yellow-100 text-yellow-600" : "bg-primary-100 text-primary-600"}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${a.severity === "critical" ? "bg-danger-50 text-danger-700" : a.severity === "high" ? "bg-yellow-50 text-yellow-700" : "bg-primary-50 text-primary-700"}`}>
                        {a.severity}
                      </span>
                      <span className="text-sm font-semibold text-text-800 capitalize">{a.triggerSource} Trigger</span>
                    </div>
                    <p className="text-xs text-text-500 font-mono">{new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {a.resolved ? (
                    <span className="flex items-center gap-1 text-sm font-bold text-success-600 bg-success-50 px-3 py-1.5 rounded-lg border border-success-100">
                      <CheckCircle2 size={16} /> Resolved
                    </span>
                  ) : (
                    <button 
                      onClick={() => resolveAlert(a._id)} 
                      className="px-4 py-2 bg-text-900 border border-transparent text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-text-900"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
