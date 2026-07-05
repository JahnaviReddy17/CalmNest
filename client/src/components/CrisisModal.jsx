import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, PhoneCall, ArrowRight, ShieldAlert, Wind, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CrisisModal({ crisis, onClose }) {
  const [step, setStep] = useState(0); // 0: Initial, 1: Breathing
  const [breathState, setBreathState] = useState("Breathe In");
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const canSeeMentorSupport = user && !user.isAnonymous && user.role !== "mentor" && user.role !== "admin";

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setBreathState(prev => {
          if (prev === "Breathe In") return "Hold";
          if (prev === "Hold") return "Breathe Out";
          return "Breathe In";
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-primary-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl max-w-lg w-full p-8 md:p-10 text-center relative overflow-hidden border border-white/40"
        >
          {/* Background Soft Blobs */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transition-all duration-4000
              ${step === 1 && breathState === "Breathe In" ? 'w-96 h-96 bg-primary-300' : ''}
              ${step === 1 && breathState === "Hold" ? 'w-96 h-96 bg-secondary-300' : ''}
              ${step === 1 && breathState === "Breathe Out" ? 'w-48 h-48 bg-primary-200' : ''}
              ${step === 0 ? 'w-64 h-64 bg-primary-200' : ''}
            `}></div>
          </div>

          <div className="relative z-10">
            {step === 0 ? (
              <>
                <motion.div 
                  className="w-20 h-20 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-6 shadow-inner"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <HeartPulse className="text-primary-600" size={40} />
                </motion.div>
                
                <h2 className="text-3xl font-extrabold text-text-900 mb-3 tracking-tight">You are safe here</h2>
                <p className="text-lg text-text-600 mb-8 leading-relaxed">
                  We noticed you might be feeling overwhelmed. Please remember that this moment will pass, and you are not alone.
                </p>

                <div className="space-y-4">
                  <button 
                    onClick={() => setStep(1)} 
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 font-semibold shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Wind size={20} />
                    Try a Breathing Exercise
                  </button>
                  
                  {canSeeMentorSupport && (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { onClose(); navigate("/mentors"); }}
                        className="py-3 bg-secondary-50 text-secondary-700 rounded-xl hover:bg-secondary-100 font-medium transition-colors flex items-center justify-center gap-2 border border-secondary-200"
                      >
                        <HeartPulse size={18} />
                        Talk to Mentor
                      </button>
                      <button className="py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 font-medium transition-colors flex items-center justify-center gap-2 border border-orange-200">
                        <UserPlus size={18} />
                        Alert Trusted Contact
                      </button>
                    </div>
                  )}

                  <a
                    href="https://988lifeline.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-danger-500 text-white rounded-2xl hover:bg-danger-600 font-bold transition-all shadow-lg shadow-danger-500/30 flex items-center justify-center gap-2 mt-4"
                  >
                    <PhoneCall size={20} />
                    Emergency 988 Lifeline
                  </a>

                  <button 
                    onClick={onClose} 
                    className="w-full py-3 text-text-500 hover:text-text-800 font-medium transition-colors mt-2"
                  >
                    I'm feeling better, close this
                  </button>
                </div>
              </>
            ) : (
              <div className="py-10">
                <h2 className="text-2xl font-bold text-text-900 mb-2">Grounding Exercise</h2>
                <p className="text-text-500 mb-12">Follow the circle and your breath.</p>
                
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-12">
                  <motion.div 
                    animate={{ 
                      scale: breathState === "Breathe In" ? 1.5 : breathState === "Breathe Out" ? 0.8 : 1.5,
                      opacity: breathState === "Hold" ? 0.8 : 1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary-400 rounded-full mix-blend-multiply opacity-50 blur-xl"
                  ></motion.div>
                  <motion.div 
                    animate={{ 
                      scale: breathState === "Breathe In" ? 1.2 : breathState === "Breathe Out" ? 0.8 : 1.2,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-24 h-24 bg-primary-500 rounded-full shadow-lg shadow-primary-500/50 flex items-center justify-center z-10"
                  >
                    <span className="text-white font-bold tracking-widest uppercase text-sm">{breathState}</span>
                  </motion.div>
                </div>

                <div className="text-left bg-white/60 p-5 rounded-2xl border border-white/60 mb-8">
                  <h3 className="font-semibold text-text-800 mb-2 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-primary-500"/>
                    5-4-3-2-1 Grounding:
                  </h3>
                  <ul className="text-sm text-text-600 space-y-1">
                    <li>👀 5 things you can see</li>
                    <li>✋ 4 things you can physically feel</li>
                    <li>👂 3 things you can hear</li>
                    <li>👃 2 things you can smell</li>
                    <li>👅 1 thing you can taste</li>
                  </ul>
                </div>

                <button 
                  onClick={() => setStep(0)} 
                  className="w-full py-3 bg-text-100 text-text-700 rounded-xl hover:bg-text-200 font-medium transition-colors"
                >
                  Back to Options
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
