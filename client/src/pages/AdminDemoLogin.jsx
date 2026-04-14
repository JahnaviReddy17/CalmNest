import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AdminDemoLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_demo_auth', 'true');
      navigate('/admin-demo');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-text-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        <div className="flex flex-col items-center">
          <div className="p-4 bg-primary-50 rounded-2xl mb-4">
            <ShieldCheck size={48} className="text-primary-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-text-900">
            Secure Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-text-500 font-medium">
            Youth Mental Health Platform Demo
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-xl text-sm text-center font-bold border border-danger-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-text-700 block mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-text-200 text-text-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-text-50 font-medium"
                placeholder="Enter admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-700 block mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-text-200 text-text-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-text-50 font-medium"
                placeholder="Enter admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all shadow-md hover:shadow-lg"
          >
            Access Dashboard
          </button>
          
          <div className="mt-6 text-center pt-4 border-t border-text-100">
            <p className="text-xs text-text-400 font-medium">Demo Credentials: 
              <span className="font-bold text-text-600 ml-1">admin / admin123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
