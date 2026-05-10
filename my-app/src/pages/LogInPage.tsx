import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginPageProps {
  onSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden border border-gray-200">

        {/* Red header band */}
        <div className="bg-[#B30838] px-8 py-6 text-center border-b-4 border-[#FDBB30]">
          <span className="text-4xl">🦅</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">Welcome Back</h2>
          <p className="text-white/70 mt-1 text-sm font-medium">Log in to your Golden Eagle account.</p>
        </div>

        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-[#B30838] border border-[#B30838]/20 p-3 rounded-lg text-sm text-center font-bold uppercase tracking-wide">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white bg-[#B30838] hover:bg-red-900 font-black rounded-lg shadow-sm transition-colors mt-2 uppercase tracking-wide disabled:opacity-40"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;