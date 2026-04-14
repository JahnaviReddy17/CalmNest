import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { SmilePlus, Bot, ShieldCheck, HeartPulse, LineChart, AlertCircle, ArrowRight, Sun, Coffee, BookHeart, Wind, UserPlus } from "lucide-react";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wellnessPlan, setWellnessPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  
  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/analytics/me");
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWellnessPlan = async () => {
    if (user?.isAnonymous) {
      setPlanLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/wellness/plan");
      setWellnessPlan(data);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
      fetchWellnessPlan();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io();
    socket.emit("join-user", { userId: user.id });

    // Instantly update local state for speed, then sync
    socket.on("moodUpdated", (newMood) => {
      setAnalytics(prev => {
        if (!prev) return prev;
        return { ...prev, moods: [...(prev.moods || []), newMood], streak: prev.streak + 1 };
      });
      fetchAnalytics();
    });

    socket.on("mentorRequested", () => {
      fetchAnalytics();
    });

    socket.on("dashboardUpdated", () => {
      fetchAnalytics();
      fetchWellnessPlan();
    });

    socket.on("chatUpdated", () => {
      fetchAnalytics();
    });

    return () => socket.disconnect();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Helper function to extract recent 7 moods properly
  const getRecentMoodData = () => {
    if (!analytics || !analytics.moods || analytics.moods.length === 0) {
      return { labels: ['No Data'], data: [0] };
    }
    const labels = analytics.moods.map(m => new Date(m.timestamp).toLocaleDateString([], { weekday: 'short' })).slice(-7);
    const data = analytics.moods.map(m => m.mood).slice(-7);
    return { labels, data };
  };

  const recentData = getRecentMoodData();

  const moodDataChart = {
    labels: recentData.labels.length > 0 ? recentData.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Mood Progression',
        data: recentData.data.length > 0 ? recentData.data : [5, 5, 5, 5, 5, 5, 5],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, min: 0, max: 6 },
      x: { grid: { display: false } }
    }
  };

  // Generate dynamic suggestions based on the last mood
  const getDynamicSuggestions = () => {
    const defaultSug = [
      { icon: <Coffee size={18} />, text: "Take a 5-minute breathing break", time: "5m" },
      { icon: <BookHeart size={18} />, text: "Reflect on a positive moment today", time: "10m" },
    ];
    
    if (!analytics || !analytics.moods || analytics.moods.length === 0) return defaultSug;
    
    const lastMood = analytics.moods[analytics.moods.length - 1].mood;
    if (lastMood <= 2) {
      return [
        { icon: <Wind size={18} />, text: "Try a 4-7-8 breathing exercise for anxiety", time: "3m" },
        { icon: <HeartPulse size={18} />, text: "Listen to a guided calming meditation", time: "10m" },
      ];
    } else if (lastMood <= 3) {
      return [
        { icon: <UserPlus size={18} />, text: "Reach out to Safe Circle for support", time: "15m" },
        { icon: <Coffee size={18} />, text: "Drink a glass of water and stretch", time: "5m" },
      ];
    }
    
    return [
      { icon: <Sun size={18} />, text: "List 3 things you are grateful for", time: "5m" },
      { icon: <BookHeart size={18} />, text: "Keep the momentum going, learn a new skill", time: "15m" },
    ];
  };

  const toggleTask = async (taskId) => {
    if (!wellnessPlan) return;
    try {
      // Optimistic Update
      setWellnessPlan(prev => {
        const newPlan = { ...prev };
        const task = newPlan.generatedPlan.find(t => t._id === taskId);
        if (task) task.completed = true;
        return newPlan;
      });
      await api.put(`/wellness/plan/${wellnessPlan._id}/task/${taskId}`);
    } catch (err) {
      console.error("Failed to update task", err);
      fetchWellnessPlan(); // Revert on failure
    }
  };

  const suggestions = getDynamicSuggestions();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-text-900 mb-2 tracking-tight">
            Welcome back{user?.isAnonymous ? "" : `, ${user?.name || user?.email?.split("@")[0]}`} 👋
          </h1>
          <p className="text-lg text-text-500">
            {user?.isAnonymous ? "You're browsing anonymously. Your privacy is protected." : "Your personal space for mental wellness and growth."}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 shadow-sm text-sm text-primary-700 font-medium">
          <Sun size={18} />
          <span>Streak: {analytics?.streak || 0} 🔥</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main large widget */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-800 flex items-center gap-2">
              <LineChart size={22} className="text-primary-500" />
              Mood Tracking
            </h2>
            <Link to="/insights" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
              Full Analytics <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="h-64 w-full relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-text-400">Loading chart...</div>
            ) : (
              <>
                {recentData.labels[0] === 'No Data' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/40 backdrop-blur-[2px] rounded-xl border border-white/60">
                    <p className="text-text-800 font-bold mb-1">No data yet, start by adding mood</p>
                    <Link to="/mood" className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-600">Add Mood</Link>
                  </div>
                )}
                <Line options={chartOptions} data={moodDataChart} />
              </>
            )}
          </div>
        </motion.div>

        {/* Daily check-in widget */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 shadow-lg shadow-primary-500/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div>
            <h2 className="text-2xl font-bold mb-2">How are you today?</h2>
            <p className="text-primary-100 mb-8 font-light">Take a moment to center yourself and reflect on your feelings.</p>
          </div>
          <Link to="/mood" className="bg-white text-primary-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors shadow-sm">
            <SmilePlus size={20} />
            Check-in Now
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { to: "/chat", icon: <Bot size={28} />, title: "AI Companion", desc: "Available 24/7", color: "text-secondary-500", bg: "bg-secondary-50 border-secondary-100" },
          { to: "/safe-circle", icon: <ShieldCheck size={28} />, title: "Safe Circle", desc: "Anonymous peer chat", color: "text-success-500", bg: "bg-success-50 border-success-100" },
          ...(user?.isAnonymous ? [] : [
            { to: "/mentor", icon: <HeartPulse size={28} />, title: "Mentor", desc: "Connect with mentor", color: "text-primary-500", bg: "bg-primary-50 border-primary-100" },
            { to: "/insights", icon: <LineChart size={28} />, title: "Insights", desc: "Your progress", color: "text-text-500", bg: "bg-white border-white/40" }
          ])
        ].map((c) => (
          <motion.div variants={itemVariants} key={c.title}>
            <Link to={c.to} className={`block bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full group`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${c.bg} ${c.color} transition-transform group-hover:scale-110`}>
                {c.icon}
              </div>
              <h3 className="font-bold text-text-800 mb-1">{c.title}</h3>
              <p className="text-text-500 text-sm">{c.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellness Details / Daily Coach */}
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-800 flex items-center gap-2">
              <Sun size={22} className="text-yellow-500" />
              Your Wellness Coach
            </h2>
            {wellnessPlan && (
              <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                {Math.round((wellnessPlan.generatedPlan.filter(t => t.completed).length / wellnessPlan.generatedPlan.length) * 100)}% Done
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {user?.isAnonymous ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                 <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-2">
                   <Sun size={32} />
                 </div>
                 <p className="text-text-500">Sign up to unlock your AI personalized daily wellness plans and track your growth journey.</p>
                 <Link to="/register" className="px-5 py-2.5 bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors font-medium">Join Now</Link>
               </div>
            ) : planLoading ? (
              <div className="flex flex-col space-y-3 h-full justify-center opacity-60">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200/50 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : wellnessPlan && wellnessPlan.generatedPlan.length > 0 ? (
              <div className="space-y-3 mt-2">
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(wellnessPlan.generatedPlan.filter(t => t.completed).length / wellnessPlan.generatedPlan.length) * 100}%` }}
                  ></div>
                </div>
                
                {wellnessPlan.generatedPlan.map((task) => (
                  <motion.div 
                    key={task._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${task.completed ? 'bg-success-50 border-success-100 opacity-70' : 'bg-white/50 border-transparent hover:border-primary-100 hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => !task.completed && toggleTask(task._id)}
                        disabled={task.completed}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-success-500 text-white' : 'border-2 border-gray-300 hover:border-primary-400'}`}
                      >
                        {task.completed && <ShieldCheck size={14} strokeWidth={3} />}
                      </button>
                      <span className={`text-sm font-medium ${task.completed ? 'text-text-400 line-through' : 'text-text-700'}`}>
                        {task.task}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-70">
                 <p className="text-text-500 mb-2">No plan generated for today.</p>
                 <button onClick={fetchWellnessPlan} className="text-sm text-primary-600 hover:underline">Refresh Coach</button>
               </div>
            )}
          </div>
        </motion.div>

        {/* Crisis Alerts (Optional, show if issues detected) */}
        {!user?.isAnonymous && (
           <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-sm relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-2 h-full ${analytics?.hasRecentAlert ? 'bg-danger-400' : 'bg-success-400'}`}></div>
             <h2 className="text-xl font-bold text-text-800 flex items-center gap-2 mb-4">
               <AlertCircle size={22} className={analytics?.hasRecentAlert ? 'text-danger-500' : 'text-success-500'} />
               Status
             </h2>
             {analytics?.hasRecentAlert ? (
               <div className="bg-danger-50 text-danger-700 p-4 rounded-2xl flex items-start gap-3 border border-danger-100">
                 <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                 <div>
                   <h4 className="font-semibold mb-1">Recent stress indicated</h4>
                   <p className="text-sm opacity-90">We noticed recent signs of high stress. Please remember you can always use the Safe Circle or connect with a Mentor for support.</p>
                 </div>
               </div>
             ) : (
               <div className="bg-success-50 text-success-700 p-4 rounded-2xl flex items-start gap-3 border border-success-100">
                 <ShieldCheck size={24} className="mt-0.5 flex-shrink-0" />
                 <div>
                   <h4 className="font-semibold mb-1">You're doing great!</h4>
                   <p className="text-sm opacity-90">No recent high-stress indicators detected. Keep up the good work and remember to log your mood daily.</p>
                 </div>
               </div>
             )}
           </motion.div>
        )}
      </div>
    </motion.div>
  );
}
