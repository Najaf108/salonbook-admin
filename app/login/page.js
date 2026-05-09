'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authLib } from '@/lib/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { user, token } = await authLib.emailLogin(email, password);
      setAuth(user, token);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500">
            Secure access for authorized personnel only
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-300 font-bold tracking-[0.2em]">
            <span className="h-[1px] w-8 bg-gray-100"></span>
            <span>RESTRICTED AREA</span>
            <span className="h-[1px] w-8 bg-gray-100"></span>
          </div>
        </form>
      </div>
    </div>
  );
}
