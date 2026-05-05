import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Log {
  id: string;
  hours: number;
  activity_date: string;
  description: string;
  Clubber: { name: string };
}

const HoursTranscriptPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [clubBreakdown, setClubBreakdown] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchTranscript();
  }, []);

  const fetchTranscript = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('users').select('first_name, last_name').eq('id', user.id).single();
      if (profile) setUserName(`${profile.first_name} ${profile.last_name}`);

      // Fetch ONLY approved hours
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, hours, activity_date, description, Clubber(name)')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('activity_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data as any[]);
        
        // Calculate Totals & Breakdown
        let total = 0;
        const breakdown: { [key: string]: number } = {};
        
        data.forEach((log: any) => {
          total += log.hours;
          const clubName = log.Clubber.name;
          breakdown[clubName] = (breakdown[clubName] || 0) + log.hours;
        });

        setTotalHours(total);
        setClubBreakdown(breakdown);
      }
    } catch (error) {
      console.error("Error fetching transcript", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Transcript...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-3xl font-bold text-gray-900">My Volunteer Transcript</h1>
          <button 
            onClick={() => window.print()} 
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* The Printable "Official" Document Area */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="border-b-2 border-gray-900 pb-6 mb-6 text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900">Official Volunteer Record</h2>
            <p className="text-gray-500 mt-1">Big Walnut High School</p>
            <p className="text-lg font-bold mt-4 text-blue-600">Student: {userName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Big Total */}
            <div className="bg-blue-50 p-6 rounded-xl text-center md:col-span-1 border border-blue-100">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Career Hours</p>
              <p className="text-5xl font-black text-gray-900 mt-2">{totalHours}</p>
            </div>

            {/* Breakdown by Club */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Hours by Organization</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(clubBreakdown).map(([club, hours]) => (
                  <div key={club} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-900">{club}</span>
                    <span className="font-bold text-blue-600">{hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Log History */}
          <div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Complete Log History</h3>
             <div className="border border-gray-200 rounded-lg overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Organization</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Activity</th>
                     <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hours</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {logs.map(log => (
                     <tr key={log.id}>
                       <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{log.activity_date}</td>
                       <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.Clubber.name}</td>
                       <td className="px-4 py-3 text-sm text-gray-600">{log.description}</td>
                       <td className="px-4 py-3 text-sm font-black text-gray-900 text-right">{log.hours}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HoursTranscriptPage;