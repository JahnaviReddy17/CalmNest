import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  AlertTriangle, 
  UserPlus, 
  Users, 
  LogOut, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- MOCK DATA ---
const MOCK_STATS = {
  totalUsers: 1248,
  activeUsers: 342,
  alertsToday: 15
};

const MOCK_ALERTS = [
  { id: 'usr_892', severity: 'High', message: 'Feeling extremely overwhelmed and cannot cope...', time: '10:45 AM' },
  { id: 'usr_124', severity: 'Medium', message: 'Need someone to talk to, feeling very lonely today.', time: '09:30 AM' },
  { id: 'usr_455', severity: 'Low', message: 'Just checking in, mild anxiety about exams.', time: '08:15 AM' },
  { id: 'usr_771', severity: 'High', message: 'Urgent: Having a panic attack right now.', time: '07:50 AM' },
  { id: 'usr_203', severity: 'Medium', message: 'Feeling sad and unmotivated for the past week.', time: 'Yesterday' }
];

const MOCK_REQUESTS = [
  { id: 'REQ-1029', status: 'Pending', mentor: 'Unassigned' },
  { id: 'REQ-1028', status: 'Assigned', mentor: 'Dr. Sarah Jenkins' },
  { id: 'REQ-1027', status: 'Accepted', mentor: 'Mark Roberts' },
  { id: 'REQ-1026', status: 'Completed', mentor: 'Dr. Sarah Jenkins' }
];

const MOCK_MENTORS = [
  { name: 'Dr. Sarah Jenkins', status: 'Active', usersHelped: 145 },
  { name: 'Mark Roberts', status: 'Active', usersHelped: 89 },
  { name: 'Dr. Emily Chen', status: 'Inactive', usersHelped: 210 },
  { name: 'James Wilson', status: 'Active', usersHelped: 42 }
];

const CHART_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Alerts per Day',
      data: [12, 19, 8, 15, 22, 10, 15],
      backgroundColor: 'rgba(239, 68, 68, 0.8)', // danger-500
      borderRadius: 6,
    }
  ]
};

export default function AdminDemoDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    if (!localStorage.getItem('admin_demo_auth')) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_demo_auth');
    navigate('/admin-login');
  };

  return (
    <div className="flex flex-col bg-background min-h-screen text-text-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-text-200 flex justify-between items-center px-6 sm:px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 p-2 rounded-lg text-white">
            <ShieldAlert size={24} />
          </div>
          <span className="font-extrabold text-xl text-text-900 tracking-tight hidden sm:block">Admin Demo</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-text-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all font-semibold border border-transparent hover:border-danger-100"
        >
          <LogOut size={20} /> <span className="hidden sm:block">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-text-100">
            <div>
              <h1 className="text-3xl font-extrabold text-text-900 tracking-tight">
                Platform Overview
              </h1>
              <p className="text-text-500 font-medium mt-1">Hackathon Demo Environment - Mock Data</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-full text-sm font-bold border border-success-200">
              <span className="w-2.5 h-2.5 bg-success-500 rounded-full animate-pulse"></span>
              System Active
            </div>
          </div>
          
          <DashboardOverview />
          <AlertsSection />
          <RequestsSection />
          <MentorsSection />
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={MOCK_STATS.totalUsers} icon={<Users size={28} />} color="primary" />
        <StatCard title="Active Users" value={MOCK_STATS.activeUsers} icon={<Activity size={28} />} color="success" />
        <StatCard title="Alerts Today" value={MOCK_STATS.alertsToday} icon={<AlertTriangle size={28} />} color="danger" />
      </div>

      {/* Basic Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-text-100">
        <h3 className="text-lg font-bold text-text-800 mb-6 flex items-center gap-2">
          <Activity size={20} className="text-primary-500" /> Alerts Trend (Last 7 Days)
        </h3>
        <div className="h-72 w-full">
          <Bar 
            data={CHART_DATA} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
            }} 
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    success: 'bg-success-50 text-success-600 border-success-100',
    danger: 'bg-danger-50 text-danger-600 border-danger-100'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-default`}>
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
        <div className="scale-[3]">{icon}</div>
      </div>
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="p-3 bg-white/80 rounded-xl backdrop-blur-sm shadow-sm">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-extrabold text-text-900 mb-1">{value}</div>
        <div className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</div>
      </div>
    </div>
  );
}

function AlertsSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-text-100 overflow-hidden">
      <div className="p-6 border-b border-text-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-extrabold text-text-900 flex items-center gap-2">
          <AlertTriangle size={22} className="text-danger-500" /> Crisis Alerts
        </h2>
      </div>
      <div className="divide-y divide-text-100">
        {MOCK_ALERTS.map((alert, i) => (
          <div key={i} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-text-50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-text-600 bg-text-100 px-2.5 py-1 rounded-md">ID: {alert.id}</span>
                <SeverityBadge severity={alert.severity} />
                <span className="text-xs text-text-400 font-medium flex items-center gap-1"><Clock size={14}/> {alert.time}</span>
              </div>
              <p className="text-text-800 font-medium italic border-l-2 border-text-200 pl-3 py-1">"{alert.message}"</p>
            </div>
            <button className="px-4 py-2 bg-text-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm w-full sm:w-auto">
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    High: 'bg-danger-100 text-danger-700 border border-danger-200',
    Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low: 'bg-primary-100 text-primary-700 border border-primary-200'
  };
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${styles[severity]}`}>
      {severity} Risk
    </span>
  );
}

function RequestsSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-text-100 overflow-hidden">
      <div className="p-6 border-b border-text-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-extrabold text-text-900 flex items-center gap-2">
          <UserPlus size={22} className="text-primary-500" /> Mentor Requests
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-text-50 text-text-500 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned Mentor</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-text-100 text-sm">
            {MOCK_REQUESTS.map((req, i) => (
              <tr key={i} className="hover:bg-text-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-text-700">{req.id}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-6 py-4 font-medium text-text-800">{req.mentor}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary-600 font-bold hover:text-primary-800 transition-colors">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Assigned: 'bg-primary-100 text-primary-700 border-primary-200',
    Accepted: 'bg-success-100 text-success-700 border-success-200',
    Completed: 'bg-text-100 text-text-700 border-text-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}

function MentorsSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-text-100 overflow-hidden">
      <div className="p-6 border-b border-text-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-extrabold text-text-900 flex items-center gap-2">
          <Users size={22} className="text-primary-500" /> Registered Mentors
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {MOCK_MENTORS.map((mentor, i) => (
          <div key={i} className="border border-text-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                <Users size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${mentor.status === 'Active' ? 'bg-success-50 text-success-700 border-success-200' : 'bg-text-100 text-text-600 border-text-200'}`}>
                {mentor.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-900 mb-2">{mentor.name}</h3>
            <div className="flex items-center gap-2 text-sm text-text-600 font-medium">
              <CheckCircle2 size={16} className="text-success-500" />
              {mentor.usersHelped} Users Helped
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
