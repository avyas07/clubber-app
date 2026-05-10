import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';


interface ClubDetailsProps {
  clubId: string;
  onBack: () => void;
  onJoinClick: () => void;
  onLogHoursClick: (clubId: string) => void;
}

const ClubDetailsPage: React.FC<ClubDetailsProps> = ({ clubId, onBack, onJoinClick, onLogHoursClick }) => {
  const [club, setClub] = useState<any>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; hours: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  const fetchClubDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: clubData } = await supabase.from('Clubber').select('*, club_members(count)').eq('id', clubId).single();

      let userIsMember = false;
      if (user && clubData) {
        const { data: memberData } = await supabase.from('club_members').select('id').eq('club_id', clubId).eq('user_id', user.id).maybeSingle();
        if (memberData) userIsMember = true;

        if (userIsMember) {
          const { data: logs } = await supabase
            .from('activity_logs')
            .select('hours, users(first_name, last_name)')
            .eq('club_id', clubId)
            .eq('status', 'approved');

          if (logs) {
            const totals: { [key: string]: number } = {};
            logs.forEach((log: any) => {
              const name = `${log.users.first_name} ${log.users.last_name}`;
              totals[name] = (totals[name] || 0) + log.hours;
            });
            const ranked = Object.entries(totals)
              .map(([name, hours]) => ({ name, hours }))
              .sort((a, b) => b.hours - a.hours);
            setLeaderboard(ranked);
          }
        }
      }

      if (clubData) {
        setClub({ ...clubData, memberCount: clubData.club_members[0]?.count || 0 });
        setIsMember(userIsMember);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-[#B30838] font-bold">Loading...</div>;
  if (!club) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Club not found.</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <button onClick={onBack} className="text-sm font-bold text-[#B30838] hover:text-[#FDBB30] uppercase tracking-wide transition-colors">
          ← Back
        </button>

        {/* Club Header Card */}
        <div className="bg-[#B30838] p-8 rounded-xl shadow-md relative overflow-hidden">
          {/* Decorative gold bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FDBB30]" />
          <div className="relative flex justify-between items-start z-10">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-bold text-[#B30838] bg-[#FDBB30] rounded-full mb-3 uppercase tracking-wide">
                {club.category}
              </span>
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">{club.name}</h1>
              <p className="text-white/70 mt-2 text-sm font-semibold uppercase tracking-wider">
                {club.memberCount} Active {club.memberCount === 1 ? 'Member' : 'Members'}
              </p>
            </div>
            {isMember ? (
              <button
                onClick={() => onLogHoursClick(clubId)}
                className="px-6 py-3 bg-[#FDBB30] text-[#B30838] font-black rounded uppercase tracking-wide hover:bg-yellow-400 transition-colors shadow"
              >
                Log Hours
              </button>
            ) : (
              <button
                onClick={onJoinClick}
                className="px-6 py-3 bg-white text-[#B30838] font-black rounded uppercase tracking-wide hover:bg-[#FDBB30] transition-colors shadow"
              >
                Join Club
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-black text-[#B30838] uppercase tracking-wide mb-3 border-b-2 border-[#FDBB30] pb-2">About Us</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{club.description}</p>
              {(club.social_links?.discord || club.social_links?.instagram) && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                  {club.social_links.discord && (
                    <a href={club.social_links.discord} target="_blank" rel="noreferrer"
                      className="px-4 py-2 bg-[#5865F2] text-white text-sm font-bold rounded hover:bg-[#4752C4]">
                      Discord
                    </a>
                  )}
                  {club.social_links.instagram && (
                    <a href={club.social_links.instagram} target="_blank" rel="noreferrer"
                      className="px-4 py-2 bg-gradient-to-tr from-[#fd5949] to-[#d6249f] text-white text-sm font-bold rounded hover:opacity-90">
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Leaderboard — Members Only */}
            {isMember && (
              <div className="bg-black p-6 rounded-xl shadow-lg text-white border-l-4 border-[#FDBB30]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#FDBB30] flex items-center gap-2">
                    🏆 Club Leaderboard
                  </h3>
                  <span className="text-xs font-bold bg-[#FDBB30]/10 text-[#FDBB30] px-3 py-1 rounded-full border border-[#FDBB30]/30">
                    Members Only
                  </span>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No hours approved yet. Be the first!</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((member, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <span className={`font-black w-6 text-center ${
                            index === 0 ? 'text-[#FDBB30] text-xl' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-bold text-gray-100">{member.name}</span>
                        </div>
                        <span className="font-black text-[#FDBB30]">{member.hours} <span className="text-xs font-normal opacity-70">hrs</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meeting Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-black text-[#B30838] uppercase tracking-wide mb-4 border-b-2 border-[#FDBB30] pb-2">Meeting Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">When</p>
                  <p className="text-gray-900 font-semibold">{club.meeting_schedule || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Where</p>
                  <p className="text-gray-900 font-semibold">{club.location || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClubDetailsPage;