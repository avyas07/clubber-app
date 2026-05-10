import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

interface CreateClubPageProps {
  onSuccess: () => void;
}

const CreateClubPage: React.FC<CreateClubPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    clubName: '',
    category: 'Academic',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a club.');

      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: newClub, error: clubError } = await supabase
        .from('Clubber')
        .insert([{
          name: formData.clubName,
          category: formData.category,
          description: formData.description,
          join_code: generatedCode,
          admin_id: user.id,
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      if (newClub) {
        const { error: rosterError } = await supabase
          .from('club_members')
          // FIX IS HERE: Added role: 'owner'
          .insert([{ user_id: user.id, club_id: newClub.id, role: 'admin' }]);
        if (rosterError) throw rosterError;
      }

      toast(`Club Created! Join Code: ${generatedCode}`, {
        icon: '🦅',
        duration: 8000, // Stay for 8 seconds
    style: {
        border: '2px solid #FDBB30', // That gold border from your UI
        padding: '16px',
        color: '#B30838', // Your brand red
        fontWeight: 'bold',
    },
  });
      onSuccess();
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast.error(error.message || 'Failed to create club.');
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
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">Create a Club</h2>
          <p className="text-white/70 mt-1 text-sm font-medium">Start a new Golden Eagle organization.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Club Name</label>
              <input
                name="clubName"
                type="text"
                required
                value={formData.clubName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none bg-white"
              >
                <option value="Academic">Academic</option>
                <option value="Athletics">Athletics</option>
                <option value="Arts">Arts</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Social">Social</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] focus:border-[#B30838] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white bg-[#B30838] hover:bg-red-900 font-black rounded-lg shadow-sm transition-colors mt-4 uppercase tracking-wide disabled:opacity-40"
            >
              {isLoading ? 'Creating...' : 'Create Club'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateClubPage;