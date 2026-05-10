import React, { useState } from 'react';
import { supabase } from '../supabaseClient';


const JoinPage: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to join a club.');

      const { data: club, error: clubError } = await supabase
        .from('Clubber')
        .select('id, name')
        .eq('join_code', joinCode)
        .single();

      if (clubError || !club) {
        throw new Error("Invalid code. We couldn't find a club with that code.");
      }

      const { error: joinError } = await supabase
        .from('club_members')
        .insert([{ user_id: user.id, club_id: club.id }]);

      if (joinError) {
        if (joinError.code === '23505') throw new Error('You are already a member of this club!');
        throw joinError;
      }

      setMessage({ type: 'success', text: `Successfully joined ${club.name}! Go Golden Eagles! 🦅` });
      setJoinCode('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong.' });
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
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">Join a Club</h2>
          <p className="text-white/70 mt-1 text-sm font-medium">Enter your 6-digit code below</p>
        </div>

        <div className="p-8 space-y-6">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold uppercase tracking-wide ${
              message.type === 'error'
                ? 'bg-red-50 text-[#B30838] border border-[#B30838]/20'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-4 text-center text-3xl tracking-widest font-black font-mono text-gray-900 bg-[#F5F5F5] border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none transition-all uppercase"
                placeholder="XXXXXX"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || joinCode.length < 6}
              className="w-full py-3 px-4 text-white bg-[#B30838] hover:bg-red-900 font-black rounded-lg shadow-sm transition-colors uppercase tracking-wide disabled:opacity-40"
            >
              {isLoading ? 'Joining...' : 'Join Now'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default JoinPage;