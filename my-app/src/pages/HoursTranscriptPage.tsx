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

      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, hours, activity_date, description, Clubber(name)')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('activity_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data as any[]);
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
      console.error('Error fetching transcript', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-[#B30838] font-bold text-lg">
      Loading Transcript...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-3xl font-black text-[#B30838] uppercase tracking-tight">My Volunteer Transcript</h1>
          <button
            onClick={() => window.print()}
            className="bg-black text-[#FDBB30] px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition-colors flex items-center gap-2 uppercase tracking-wide text-sm"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* Printable Document */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200">

          {/* Official Header */}
          <div className="border-b-4 border-[#B30838] pb-6 mb-6 text-center">
            <div className="flex justify-center mb-3">
              <span className="text-5xl">🦅</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#B30838]">
              Official Volunteer Record
            </h2>
            <p className="text-gray-500 mt-1 font-semibold uppercase tracking-widest text-sm">
              Big Walnut High School — Golden Eagles
            </p>
            <p className="text-lg font-black mt-4 text-black uppercase tracking-wide">
              Student: <span className="text-[#B30838]">{userName}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Total Hours */}
            <div className="bg-[#B30838] p-6 rounded-xl text-center md:col-span-1 border-b-4 border-[#FDBB30]">
              <p className="text-sm font-black text-white/80 uppercase tracking-wider">Total Career Hours</p>
              <p className="text-6xl font-black text-[#FDBB30] mt-2">{totalHours}</p>
              <p className="text-white/60 text-xs mt-1 uppercase tracking-widest">Approved Hours</p>
            </div>

            {/* Breakdown by Club */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-black text-[#B30838] uppercase tracking-wider mb-3 border-b-2 border-[#FDBB30] pb-1">
                Hours by Organization
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(clubBreakdown).map(([club, hours]) => (
                  <div key={club} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-semibold text-gray-900 text-sm">{club}</span>
                    <span className="font-black text-[#B30838] text-sm">{hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Log Table */}
          <div>
            <h3 className="text-sm font-black text-[#B30838] uppercase tracking-wider mb-4 border-b-2 border-[#FDBB30] pb-1">
              Complete Log History
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#B30838]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Activity</th>
                    <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, i) => (
                    <tr key={log.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{log.activity_date}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{log.Clubber.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.description}</td>
                      <td className="px-4 py-3 text-sm font-black text-[#B30838] text-right">{log.hours}</td>
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