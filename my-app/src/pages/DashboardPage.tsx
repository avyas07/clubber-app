import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';


interface Club {
  id: string;
  name: string;
  category: string;
  role: string;
  memberCount: number;
}

interface ActivityLog {
  id: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  activity_date: string;
  Clubber: { name: string };
}

interface DashboardPageProps {
  onViewClub: (id: string) => void;
  onManageClub: (id: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onViewClub, onManageClub }) => {
  const [firstName, setFirstName] = useState('');
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myHours, setMyHours] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('users').select('first_name').eq('id', user.id).single();
      if (profileData) setFirstName(profileData.first_name);

      const { data: rosterData } = await supabase.from('club_members')
        .select(`club_id, role, Clubber (id, name, category, club_members(count))`)
        .eq('user_id', user.id);

      if (rosterData) {
        const formattedClubs = rosterData
          .map(row => {
            const club = row.Clubber as any;
            if (!club) return null;
            return { ...club, role: row.role, memberCount: club.club_members[0]?.count || 0 } as Club;
          }).filter((club): club is Club => club !== null);
        setMyClubs(formattedClubs);
      }

      const { data: hoursData } = await supabase.from('activity_logs')
        .select('id, hours, description, status, activity_date, Clubber(name)')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });
      if (hoursData) setMyHours(hoursData as unknown as ActivityLog[]);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-[#B30838] font-bold text-lg">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-[#B30838] p-8 rounded-xl shadow-md flex justify-between items-center border-b-4 border-[#FDBB30]">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Welcome, <span className="text-[#FDBB30]">{firstName || 'Student'}</span>!
            </h1>
            <p className="text-white/70 mt-1 font-medium">Your Golden Eagle Club Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* My Hours History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-black text-[#B30838] uppercase tracking-wide mb-4 border-b-2 border-[#FDBB30] pb-2">
              My Hours History
            </h3>
            {myHours.length === 0 ? (
              <div className="py-6 bg-[#F5F5F5] rounded-lg border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">No hours logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myHours.map(log => (
                  <div key={log.id} className="p-4 rounded-lg border border-gray-100 bg-[#F5F5F5] flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide">{log.Clubber.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{log.activity_date}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-lg text-gray-900">
                        {log.hours} <span className="text-xs font-normal text-gray-500">hrs</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        log.status === 'approved' ? 'bg-green-100 text-green-700' :
                        log.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Clubs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b-2 border-[#FDBB30] pb-2">
              <h3 className="text-lg font-black text-[#B30838] uppercase tracking-wide">My Clubs</h3>
              <span className="text-xs font-bold text-[#B30838] bg-red-50 border border-[#B30838]/20 px-2 py-1 rounded-full">
                {myClubs.length} Joined
              </span>
            </div>
            {myClubs.length === 0 ? (
              <p className="text-gray-500 text-sm">You haven't joined any clubs yet.</p>
            ) : (
              <div className="space-y-3">
                {myClubs.map(club => {
                  const isLeadership = club.role === 'admin' || club.role === 'owner';
                  return (
                    <div key={club.id} className="p-4 rounded-lg border border-gray-100 hover:border-[#B30838] transition-all bg-[#F5F5F5]">
                      <div className="flex justify-between items-start mb-2">
                        <button
                          onClick={() => isLeadership ? onManageClub(club.id) : onViewClub(club.id)}
                          className="font-black text-gray-900 hover:text-[#B30838] text-left transition-colors flex items-center gap-2 uppercase text-sm tracking-wide"
                        >
                          {club.name}
                          {isLeadership && <span title="Manage Club">⚙️</span>}
                        </button>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                          club.role === 'owner' ? 'bg-[#FDBB30] text-black' :
                          club.role === 'admin' ? 'bg-[#B30838] text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {club.role}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-2 border-t border-gray-200 pt-2">
                        <span className="text-xs text-gray-500">{club.category}</span>
                        <span className="text-[10px] text-[#B30838] font-bold uppercase tracking-tight">
                          {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;