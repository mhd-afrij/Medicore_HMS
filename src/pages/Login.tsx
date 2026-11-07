import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, User, Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE?.trim() || 'http://localhost:3000';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin26');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message || 'Invalid credentials');
        return;
      }

      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('authUser', JSON.stringify(data.data.user));
      navigate('/dashboard');
    } catch {
      setError('Unable to connect to the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-sm">
          <Briefcase className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-[#1e3a8a]">MediCore HMS</h1>
        <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase mt-1">
          High-Stakes Clinical System
        </p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
        <p className="text-sm text-slate-500 mb-6">
          Please enter your credentials to access your dashboard.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin26"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg px-4 py-2.5 transition-colors mt-2 disabled:bg-slate-300">
            {isLoading ? 'Signing In...' : 'Login →'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Demo Account:</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
            admin / admin26
          </span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 mb-2">
          &copy; 2026 MediCore HMS. All Rights Reserved.
        </p>
        <div className="flex items-center justify-center space-x-1.5">
          <span className="text-xs text-slate-500">System Status:</span>
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span className="text-xs font-medium text-teal-600">Operational</span>
        </div>
      </div>
    </div>
  );
}
