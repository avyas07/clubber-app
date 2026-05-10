import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import LandingPage from './pages/LandingPage'; 
import JoinPage from './pages/JoinPage'; 
import CreateClubPage from './pages/CreateClubPage';
import AllClubsPage from './pages/AllClubsPage'; 
import SignUpPage from './pages/SignUpPage'; 
import LoginPage from './pages/LogInPage'; 
import DashboardPage from './pages/DashboardPage'; 
import ClubDetailsPage from './pages/ClubDetailsPage'; 
import LogHoursPage from './pages/LogHoursPage'; 
import AdminHubPage from './pages/AdminHubPage'; 
import HoursTranscriptPage from './pages/HoursTranscriptPage'; 
import { inject } from "@vercel/analytics"
import { Toaster } from 'react-hot-toast';


inject();

// NEW: Added 'transcript' to allowed routes
type PageState = 'landing' | 'join' | 'create' | 'all-clubs' | 'signup' | 'login' | 'dashboard' | 'club-details' | 'log-hours' | 'admin-hub' | 'transcript';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');
  const [session, setSession] = useState<any>(null);
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [intendedRoute, setIntendedRoute] = useState<PageState | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('landing'); 
  };

  const handleViewClub = (id: string) => {
    setActiveClubId(id);
    setCurrentPage('club-details');
  };

  const handleManageClub = (id: string) => {
    setActiveClubId(id);
    setCurrentPage('admin-hub');
  };

  const handleBackFromDetails = () => {
    if (session) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('all-clubs');
    }
  };

  const requireAuth = (targetPage: PageState) => {
    if (session) {
      setCurrentPage(targetPage); 
    } else {
      setIntendedRoute(targetPage); 
      setCurrentPage('signup');     
    }
  };

  const handleAuthSuccess = () => {
    if (intendedRoute) {
      setCurrentPage(intendedRoute); 
      setIntendedRoute(null);        
    } else {
      setCurrentPage('dashboard');   
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navigation Bar */}
      {currentPage !== 'landing' && (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm print:hidden">
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('landing')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</button>
            <button onClick={() => setCurrentPage('all-clubs')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Explore Clubs</button>
            
            {/* NEW: Transcript Button added for logged-in users */}
            {session && (
               <>
                 <button onClick={() => setCurrentPage('dashboard')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Dashboard</button>
                 <button onClick={() => setCurrentPage('transcript')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Transcript</button>
               </>
            )}
          </div>
          
          <div className="flex gap-3">
            {session ? (
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                Log Out
              </button>
            ) : (
              <>
                <button onClick={() => setCurrentPage('login')} className="text-sm font-medium text-blue-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  Log In
                </button>
                <button onClick={() => setCurrentPage('signup')} className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* Page Routing */}
      {currentPage === 'landing' && (
        <LandingPage 
          onGetStarted={() => requireAuth('join')} 
          onCreateClub={() => requireAuth('create')} 
        />
      )}
      {currentPage === 'join' && <JoinPage />}
      {currentPage === 'create' && <CreateClubPage onSuccess={() => setCurrentPage('all-clubs')} />}
      
      {currentPage === 'all-clubs' && <AllClubsPage onViewClub={handleViewClub} />}
      
      {currentPage === 'dashboard' && (
        <DashboardPage 
          onViewClub={handleViewClub} 
          onManageClub={handleManageClub} 
        />
      )}
      
      {currentPage === 'admin-hub' && activeClubId && (
        <AdminHubPage 
          clubId={activeClubId} 
          onBack={() => setCurrentPage('dashboard')} 
        />
      )}
      
      {currentPage === 'club-details' && activeClubId && (
        <ClubDetailsPage 
          clubId={activeClubId} 
          onBack={handleBackFromDetails} 
          onJoinClick={() => requireAuth('join')} 
          onLogHoursClick={(id) => {
            setActiveClubId(id);
            setCurrentPage('log-hours'); 
          }}
        />
      )}

      {currentPage === 'log-hours' && activeClubId && (
        <LogHoursPage 
          clubId={activeClubId} 
          onBack={() => setCurrentPage('club-details')} 
          onSuccess={() => setCurrentPage('dashboard')} 
        />
      )}

      {/* NEW: The Transcript Route */}
      {currentPage === 'transcript' && <HoursTranscriptPage />}

      {currentPage === 'signup' && <SignUpPage onSuccess={handleAuthSuccess} />}
      {currentPage === 'login' && <LoginPage onSuccess={handleAuthSuccess} />}

      <Toaster position="top-center" />

    </div>
    
  );
};

export default App;