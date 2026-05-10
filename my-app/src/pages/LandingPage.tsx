import React from 'react';
 
interface LandingPageProps {
  onGetStarted: () => void;
  onCreateClub: () => void;
}
 
const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onCreateClub }) => {
  return (
    <div className="min-h-screen bg-[#B30838] flex flex-col">
 
      {/* Top bar */}
      <div className="bg-black py-2 px-6 text-center">
        <span className="text-[#FDBB30] text-xs font-bold uppercase tracking-widest">
          Big Walnut High School — Go Golden Eagles! 🦅
        </span>
      </div>
 
      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-20 text-center">
        {/* Eagle icon / badge */}
        <div className="mb-6 w-24 h-24 rounded-full bg-[#FDBB30] flex items-center justify-center shadow-lg border-4 border-black">
          <span className="text-5xl">🦅</span>
        </div>
 
        <h1 className="text-6xl sm:text-7xl font-black text-white uppercase tracking-tight leading-none mb-3">
          BWHS<br />
          <span className="text-[#FDBB30]">Clubber</span>
        </h1>
 
        <p className="text-white/80 text-lg max-w-xl mx-auto mt-4 mb-10 font-medium">
          Manage your Golden Eagle organizations and track your extracurricular hours — all in one place.
        </p>
 
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-10 py-4 text-base font-black text-[#B30838] bg-[#FDBB30] rounded uppercase tracking-wider hover:bg-yellow-400 transition-colors shadow-lg"
          >
            Join a Club
          </button>
          <button
            onClick={onCreateClub}
            className="px-10 py-4 text-base font-black text-white bg-transparent border-2 border-white rounded uppercase tracking-wider hover:bg-white/10 transition-colors shadow-lg"
          >
            Create a Club
          </button>
        </div>
      </div>
 
      {/* Footer strip */}
      <div className="bg-black py-3 px-6 text-center">
        <span className="text-white/50 text-xs"> Big Walnut High School · Sunbury, Ohio</span>
      </div>
 
    </div>
  );
};
 
export default LandingPage;