import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Sparkles, Feather } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Relax() {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Interactive background logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 8 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -2 - 0.5;
        this.color = `hsla(${Math.random() * 60 + 200}, 80%, 70%, ${Math.random() * 0.5 + 0.1})`;
        this.life = 100;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Float effect
        this.speedX += (Math.random() - 0.5) * 0.1;
        this.life -= 0.5;
        if (this.y < -50 || this.life <= 0) {
          this.y = canvas.height + 50;
          this.x = Math.random() * canvas.width;
          this.life = 100;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(x, y));
      }
      if (particles.length > 200) particles.splice(0, 3);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // Note: In a real app we would play actual audio here.
    // audioRef.current[isPlaying ? 'pause' : 'play']();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 mx-auto max-w-7xl shadow-2xl">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full cursor-pointer z-0"
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 p-10 flex flex-col pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-extralight text-white tracking-widest flex items-center gap-3 drop-shadow-md">
            <Feather size={32} />
            RELAX
          </h1>
          <p className="text-white/70 mt-2 font-light tracking-wide">Move your cursor to paint with feelings. Breathe deeply.</p>
        </motion.div>

        <div className="mt-auto self-center pointer-events-auto">
           <motion.div 
             animate={{ scale: [1, 1.05, 1] }} 
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="w-48 h-48 rounded-full border border-white/20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-[0_0_40px_rgba(255,255,255,0.1)] relative"
           >
             <Sparkles size={24} className="text-white/50 mb-2 absolute top-8" />
             <span className="text-white font-light tracking-widest mt-4">BREATHE</span>
           </motion.div>
        </div>

        <div className="mt-auto ml-auto pointer-events-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-6 shadow-xl">
           <div className="flex flex-col">
             <span className="text-white text-sm font-medium">Ambient Flow</span>
             <span className="text-white/60 text-xs">Binaural Beats</span>
           </div>
           <button 
             onClick={toggleAudio}
             className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors tooltip"
             title={isPlaying ? "Pause Ambient Sound" : "Play Ambient Sound"}
           >
             {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
           </button>
        </div>
      </div>
    </div>
  );
}
