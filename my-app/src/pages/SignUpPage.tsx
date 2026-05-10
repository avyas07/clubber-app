import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface SignUpPageProps {
  onSuccess: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'student',
          }]);
        if (dbError) throw dbError;
        onSuccess();
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrorMsg(error.message || 'Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden border border-gray-200">

        {/* Red header band */}
        <div className="bg-[#B30838] px-8 py-6 text-center border-b-4 border-[#FDBB30]">
          <span className="text-4xl">🦅</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">Create an Account</h2>
          <p className="text-white/70 mt-1 text-sm font-medium">Join and start tracking your hours.</p>
        </div>

        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-[#B30838] border border-[#B30838]/20 p-3 rounded-lg text-sm text-center font-bold uppercase tracking-wide">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none"
                />
              </div>
            </div>

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
                minLength={6}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;