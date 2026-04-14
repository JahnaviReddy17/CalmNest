import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Trophy, Star, Medal, Zap, Diamond, Target, Award } from "lucide-react";
import api from "../services/api";
import { io } from "socket.io-client";

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const { data } = await api.get("/wellness/achievements");
      setAchievements(data);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
      
      const socket = io();
      socket.emit("join-user", { userId: user.id });
      socket.on("achievementUnlocked", () => {
        fetchAchievements();
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const getBadgeIcon = (name) => {
    const lName = name.toLowerCase();
    if (lName.includes("champion") || lName.includes("warrior")) return <Trophy className="text-yellow-500" size={32} />;
    if (lName.includes("first")) return <Star className="text-blue-500" size={32} />;
    if (lName.includes("streak") || lName.includes("consistency")) return <Zap className="text-orange-500" size={32} />;
    if (lName.includes("master")) return <Diamond className="text-purple-500" size={32} />;
    return <Award className="text-primary-500" size={32} />;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto pb-12">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-extrabold text-text-900 mb-2 tracking-tight">
          Your Achievements 🏆
        </h1>
        <p className="text-lg text-text-500">
          Track your mental wellness progress and milestones.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [...Array(6)].map((_, i) => (
             <div key={i} className="bg-white/40 h-40 rounded-3xl animate-pulse border border-white/40 shadow-sm"></div>
           ))
        ) : achievements.length > 0 ? (
          achievements.map((ach) => (
            <motion.div variants={itemVariants} key={ach._id} className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {getBadgeIcon(ach.badgeName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-800 mb-1 leading-tight">{ach.badgeName}</h3>
                  <p className="text-sm text-text-500">{ach.description}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center relative z-10">
                <span className="text-xs font-semibold text-text-400 uppercase tracking-wider">Unlocked</span>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                  {new Date(ach.unlockedAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-lg">
            <Target size={48} className="mx-auto text-primary-300 mb-4" />
            <h3 className="text-xl font-bold text-text-700 mb-2">No achievements yet</h3>
            <p className="text-text-500 max-w-sm mx-auto">Start completing wellness activities, meditation sessions, and mood check-ins to earn badges!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
