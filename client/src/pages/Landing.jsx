import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Shield, MessageCircle, Users, HeartPulse, ArrowRight, ShieldCheck } from "lucide-react";

export default function Landing() {
  const { user, loginAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleAnonymous = async () => {
    await loginAnonymous();
    navigate("/dashboard");
  };

  useEffect(() => {
    if (user) {
      if (user.role === "mentor") navigate("/mentor-dashboard");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Animated Gradient Blobs */}
      <div className="absolute w-full h-full inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-success-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        <motion.div 
          className="text-center w-full max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-8 text-primary-700 font-medium">
            <ShieldCheck size={18} className="text-primary-500" />
            <span>Privacy-First Mental Health Platform</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-text-900 mb-6 tracking-tight leading-tight">
            Your Safe Space for <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Mental Wellness</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-text-600 mb-10 max-w-2xl mx-auto font-light">
            An elegant, anonymous sanctuary offering AI support, peer mentorship, and real-time crisis help. 
            Because your well-being matters.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleAnonymous}
              className="group relative px-8 py-4 bg-primary-600 text-white rounded-2xl text-lg font-semibold hover:bg-primary-500 shadow-xl shadow-primary-500/30 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span>Continue Anonymously</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white/70 backdrop-blur-lg border-2 border-primary-200 text-primary-700 rounded-2xl text-lg font-semibold hover:bg-white hover:border-primary-400 shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              Get Support Now
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full"
        >
          {[
            { 
              icon: <MessageCircle size={32} className="text-primary-500" />, 
              title: "AI Support", 
              desc: "Empathetic, 24/7 intelligent chat ready to listen when you need it most."
            },
            { 
              icon: <Users size={32} className="text-secondary-500" />, 
              title: "Peer Mentorship", 
              desc: "Connect anonymously with verified mentors who understand your journey."
            },
            { 
              icon: <HeartPulse size={32} className="text-success-500" />, 
              title: "Crisis Help", 
              desc: "Real-time emergency detection and calming exercises for extreme stress."
            },
          ].map((f) => (
            <motion.div 
              key={f.title} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-800 mb-3 tracking-tight">{f.title}</h3>
              <p className="text-text-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
