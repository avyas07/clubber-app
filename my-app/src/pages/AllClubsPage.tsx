import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';


interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
}

interface AllClubsPageProps {
  onViewClub: (id: string) => void;
}

const AllClubsPage: React.FC<AllClubsPageProps> = ({ onViewClub }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('Clubber')
        .select(`*, club_members (count)`)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const clubsWithCounts = data.map((club: any) => ({
          ...club,
          memberCount: club.club_members[0]?.count || 0,
        }));
        setClubs(clubsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#B30838] font-bold text-lg">
        Loading clubs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="text-center border-b-4 border-[#B30838] pb-6">
          <h2 className="text-4xl font-black text-[#B30838] uppercase tracking-tight">Explore Clubs</h2>
          <p className="text-gray-600 mt-2 font-medium">Discover and join Golden Eagle organizations.</p>
        </div>

        {clubs.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border-l-4 border-[#FDBB30]">
            <p className="text-gray-500">No clubs have been created yet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map(club => (
              <div
                key={club.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#B30838] transition-all overflow-hidden flex flex-col"
              >
                {/* Gold top accent bar */}
                <div className="h-1 bg-[#FDBB30]" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <button
                      onClick={() => onViewClub(club.id)}
                      className="text-base font-black text-gray-900 hover:text-[#B30838] text-left transition-colors uppercase tracking-tight leading-tight"
                    >
                      {club.name}
                    </button>
                    <span className="shrink-0 inline-block px-2 py-1 text-[10px] font-bold text-[#B30838] bg-red-50 border border-[#B30838]/20 rounded-full uppercase">
                      {club.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    {club.memberCount} Members
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 flex-1">{club.description}</p>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onViewClub(club.id)}
                      className="text-sm text-[#B30838] font-bold hover:text-[#FDBB30] transition-colors uppercase tracking-wide"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllClubsPage;