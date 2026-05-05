import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LogHoursPageProps {
  clubId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const LogHoursPage: React.FC<LogHoursPageProps> = ({ clubId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    hours: '',
    activityDate: new Date().toISOString().split('T')[0], // Defaults to today
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in.");

      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          club_id: clubId,
          hours: parseFloat(formData.hours),
          activity_date: formData.activityDate,
          description: formData.description,
          status: 'pending' // Automatically starts as pending
        }]);

      if (error) throw error;
      
      alert("Hours submitted! Waiting for Admin approval.");
      onSuccess();
    } catch (error: any) {
      console.error('Error logging hours:', error);
      alert(error.message || "Failed to log hours.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full space-y-6">
        
        <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:underline mb-2 block">
          &larr; Back to Club
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Log Your Hours</h2>
          <p className="text-gray-500 mt-2">Submit your volunteer time for approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                name="hours"
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.hours}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                name="activityDate"
                type="date"
                required
                value={formData.activityDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What did you do?</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Helped set up the event booth..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors mt-4"
          >
            {isLoading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogHoursPage;