import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

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
      // 1. Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a club.");

      // 2. Generate a random 6-character code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 3. Insert the club AND return the new club's data so we can get its new ID
      const { data: newClub, error: clubError } = await supabase
        .from('Clubber')
        .insert([{ 
          name: formData.clubName, 
          category: formData.category, 
          description: formData.description,
          join_code: generatedCode,
          admin_id: user.id // <-- WE SET THE CREATOR AS THE ADMIN HERE
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      // 4. Automatically add the creator to the club_members roster!
      if (newClub) {
        const { error: rosterError } = await supabase
          .from('club_members')
          .insert([{ 
            user_id: user.id, 
            club_id: newClub.id 
          }]);
          
        if (rosterError) throw rosterError;
      }

      alert(`Club Created! Your join code is: ${generatedCode}`);
      onSuccess(); 

    } catch (error: any) {
      console.error('Error creating club:', error);
      alert(error.message || 'Failed to create club. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create a Club</h2>
          <p className="text-gray-500 mt-2">Start a new organization on campus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
            <input
              name="clubName"
              type="text"
              required
              value={formData.clubName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
            >
              <option value="Academic">Academic</option>
              <option value="Athletics">Athletics</option>
              <option value="Arts">Arts</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors mt-4 disabled:bg-blue-400"
          >
            {isLoading ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClubPage;