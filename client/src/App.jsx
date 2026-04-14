import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MentorSidebar from "./components/MentorSidebar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import MoodCheckin from "./pages/MoodCheckin";
import AIChat from "./pages/AIChat";
import SafeCircle from "./pages/SafeCircle";
import MentorsList from "./pages/MentorsList";
import MentorChat from "./pages/MentorChat";
import Insights from "./pages/Insights";
import NGODashboard from "./pages/NGODashboard";
import MyModules from "./pages/MyModules";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MentorDashboard from "./pages/MentorDashboard";
import MentorModules from "./pages/MentorModules";
import MentorPatientProfile from "./pages/MentorPatientProfile";
import WellnessActivities from "./pages/WellnessActivities";
import Achievements from "./pages/Achievements";
import Relax from "./pages/Relax";
import CrisisModal from "./components/CrisisModal";
import AdminDemoLogin from "./pages/AdminDemoLogin";
import AdminDemoDashboard from "./pages/AdminDemoDashboard";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const [crisis, setCrisis] = useState(null);
  const { user } = useAuth();
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/admin-login') || location.pathname.startsWith('/admin-demo');

  return (
    <div className="min-h-screen bg-background font-sans text-text-800 selection:bg-primary-200 selection:text-primary-900">
      {!user && !isDemo && <Navbar />}
      {user && user.role !== "mentor" && <Sidebar />}
      {user && user.role === "mentor" && <MentorSidebar />}
      
      {crisis && <CrisisModal crisis={crisis} onClose={() => setCrisis(null)} />}
      
      <main className={`transition-all duration-300 ${user ? 'ml-64 p-8' : 'w-full'}`}>
        <div className={user ? 'max-w-7xl mx-auto' : 'w-full'}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} /> {/* Alias for register */}
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MoodCheckin onCrisis={setCrisis} /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AIChat onCrisis={setCrisis} /></ProtectedRoute>} />
            <Route path="/safe-circle" element={<ProtectedRoute><SafeCircle /></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute><MentorsList /></ProtectedRoute>} />
            <Route path="/user-chat/:mentorId" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/my-modules" element={<ProtectedRoute><MyModules /></ProtectedRoute>} />
            <Route path="/wellness-activities" element={<ProtectedRoute><WellnessActivities /></ProtectedRoute>} />
            <Route path="/relax" element={<ProtectedRoute><Relax /></ProtectedRoute>} />
            
            {/* Mentor Routes */}
            <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor-chat/:userId" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
            <Route path="/mentor-patient/:id" element={<ProtectedRoute><MentorPatientProfile /></ProtectedRoute>} />
            <Route path="/mentor-modules" element={<ProtectedRoute><MentorModules /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute><NGODashboard /></ProtectedRoute>} />
            <Route path="/ngo" element={<ProtectedRoute><NGODashboard /></ProtectedRoute>} /> {/* Alias */}
            
            {/* Admin Hackathon Demo Routes (Mock Data) */}
            <Route path="/admin-login" element={<AdminDemoLogin />} />
            <Route path="/admin-demo" element={<AdminDemoDashboard />} />
          </Routes>
        </div>
      </main>
      
      {/* Floating Emergency Stress Button */}
      {user && (
        <button
          onClick={() => setCrisis({ level: "high", message: "Emergency stress button activated." })}
          className="fixed bottom-8 right-8 w-16 h-16 bg-danger-500 text-white rounded-full shadow-[0_8px_30px_rgb(239,68,68,0.4)] flex items-center justify-center hover:bg-danger-600 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group overflow-hidden"
          title="Emergency Help"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:animate-pulse"></div>
          <span className="text-3xl relative z-10 drop-shadow-md">🚨</span>
        </button>
      )}
    </div>
  );
}
