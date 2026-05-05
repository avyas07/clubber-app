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
      // 1. Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to join a club.");

      // 2. Search for the club using the 6-digit code
      const { data: club, error: clubError } = await supabase
        .from('Clubber')
        .select('id, name')
        .eq('join_code', joinCode)
        .single(); // We expect exactly one club to have this code

      if (clubError || !club) {
        throw new Error("Invalid code. We couldn't find a club with that code.");
      }

      // 3. Add the user and the club to the roster (club_members table)
      const { error: joinError } = await supabase
        .from('club_members')
        .insert([{ 
          user_id: user.id, 
          club_id: club.id 
        }]);

      if (joinError) {
        // Code 23505 means "unique violation" - they are already in the club!
        if (joinError.code === '23505') throw new Error("You are already a member of this club!");
        throw joinError;
      }

      // Success!
      setMessage({ type: 'success', text: `Successfully joined ${club.name}!` });
      setJoinCode(''); // Clear the input
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join a Big Nut Club</h2>
          <p className="text-gray-500 mt-2">Enter your 6-digit code below</p>
        </div>

        {/* Display Success or Error Messages */}
        {message.text && (
          <div className={`p-3 rounded-lg text-sm text-center font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
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
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all uppercase"
              placeholder="XXXXXX"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || joinCode.length < 6}
            className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors disabled:bg-blue-300"
          >
            {isLoading ? 'Joining...' : 'Join Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;