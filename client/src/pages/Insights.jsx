import { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler, Legend } from "chart.js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Calendar, Activity, BrainCircuit, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler, Legend);

export default function Insights() {
  const { user } = useAuth();
  const [moods, setMoods] = useState([]);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch
    api.get(`/mood/history/${user.id}`).then(({ data }) => setMoods(data.reverse())).catch(() => { setApiError(true); });

    // Socket real-time connection
    const socket = io();
    socket.emit("join-user", { userId: user.id });

    socket.on("moodUpdated", (newMood) => {
      setMoods(prev => [...prev, newMood]);
    });

    return () => socket.disconnect();
  }, [user]);

  // Derived calculations
  const totalCheckins = moods.length;
  const avgMood = totalCheckins > 0 ? (moods.reduce((acc, m) => acc + m.mood, 0) / totalCheckins).toFixed(1) : 0;
  
  // Calculate mood distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  moods.forEach(m => distribution[m.mood] = (distribution[m.mood] || 0) + 1);
  const pieData = Object.values(distribution);

  const lastDays = moods.slice(-7);
  // Detect negative trend (3+ low moods in recent history)
  const recentLowMoods = lastDays.filter(m => m.mood <= 2).length;
  const isNegativeTrend = recentLowMoods >= 3;

  const stressLevel = isNegativeTrend ? "High" : avgMood < 3 ? "Elevated" : "Low";

  // Data for Line Chart
  const chartData = {
    labels: lastDays.length > 0 ? lastDays.map((m) => new Date(m.timestamp).toLocaleDateString(undefined, { weekday: 'short' })) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: "Mood Score",
      data: lastDays.length > 0 ? lastDays.map((m) => m.mood) : [3, 4, 3, 5, 4, 5, 5],
      borderColor: "#8B5CF6",
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#8B5CF6",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#8B5CF6",
    }],
  };

  const pieChartData = {
    labels: ['1 - Terrible', '2 - Bad', '3 - Okay', '4 - Good', '5 - Great'],
    datasets: [{
      data: pieData.reduce((a, b) => a + b, 0) === 0 ? [1, 1, 1, 1, 1] : pieData, // placeholder if empty
      backgroundColor: ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#8B5CF6"],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 1, max: 5, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94A3B8' } },
      x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto pb-10">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-extrabold text-text-900 mb-2 tracking-tight flex items-center gap-3">
          <Activity size={36} className="text-primary-500" /> Dashboard Insights
        </h1>
        <p className="text-lg text-text-500">Live analytics updated instantly through Real-Time tracking.</p>
      </motion.div>

      {apiError && (
        <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 text-center">
          <h2 className="text-lg font-bold">Service temporarily unavailable</h2>
          <p className="text-sm mt-1">We are having trouble connecting to your history. Please try again later.</p>
        </motion.div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-primary-50">
            <TrendingUp className="text-primary-500" size={24} />
          </div>
          <h3 className="text-text-500 text-sm font-medium mb-1">Average Mood</h3>
          <div className="text-2xl font-bold text-text-900 mb-1">{avgMood} / 5</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-orange-50">
            <Flame className="text-orange-500" size={24} />
          </div>
          <h3 className="text-text-500 text-sm font-medium mb-1">Total Check-ins</h3>
          <div className="text-2xl font-bold text-text-900 mb-1">{totalCheckins}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-secondary-50">
            <BrainCircuit className="text-secondary-500" size={24} />
          </div>
          <h3 className="text-text-500 text-sm font-medium mb-1">Stress Level</h3>
          <div className={`text-2xl font-bold mb-1 ${stressLevel === 'High' ? 'text-danger-500' : 'text-text-900'}`}>{stressLevel}</div>
        </motion.div>

        <motion.div variants={itemVariants} className={`border rounded-3xl p-6 shadow-sm transition-all ${isNegativeTrend ? 'bg-danger-50 border-danger-100' : 'bg-success-50 border-success-100'}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-sm">
            {isNegativeTrend ? <AlertTriangle className="text-danger-500" size={24} /> : <ShieldCheck className="text-success-500" size={24} />}
          </div>
          <h3 className="text-text-600 text-sm font-medium mb-1">Crisis Risk Indicator</h3>
          <div className={`text-xl font-bold mb-1 ${isNegativeTrend ? 'text-danger-700' : 'text-success-700'}`}>
            {isNegativeTrend ? "Elevated Risk" : "Stable Pattern"}
          </div>
        </motion.div>
      </div>

      {isNegativeTrend && (
        <motion.div variants={itemVariants} className="mb-8 bg-gradient-to-r from-danger-500 to-orange-500 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <AlertTriangle size={32} />
            <div>
              <h3 className="text-xl font-bold">Your stress level is increasing.</h3>
              <p className="text-white/80">Consider talking to a mentor to help you navigate these feelings safely.</p>
            </div>
          </div>
          <Link to="/mentor" className="relative z-10 px-6 py-3 bg-white text-danger-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
            Connect with Mentor
          </Link>
        </motion.div>
      )}

      {totalCheckins === 0 && !apiError && (
        <motion.div variants={itemVariants} className="bg-primary-50 border border-primary-200 text-primary-800 p-6 rounded-3xl text-center mb-8 shadow-sm">
          <HeartPulse size={40} className="mx-auto text-primary-400 mb-3" />
          <h3 className="text-xl font-bold mb-1">No data yet</h3>
          <p className="mb-4">Start by adding your first mood check-in to build your insights.</p>
          <Link to="/mood" className="px-6 py-2 bg-primary-600 text-white rounded-xl font-medium inline-block hover:bg-primary-500">Log Check-in</Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-text-900 mb-6 flex items-center gap-2">
            <TrendingUp size={22} className="text-primary-500" /> Mood Trend Analytics (Last 7 Days)
          </h2>
          <div className="h-80 w-full relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-text-900 flex items-center gap-2 mb-6">
            <Activity size={22} className="text-secondary-500" /> Mood Distribution
          </h2>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
