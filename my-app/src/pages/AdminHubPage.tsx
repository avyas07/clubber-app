import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AdminHubProps {
  clubId: string;
  onBack: () => void;
}

const AdminHubPage: React.FC<AdminHubProps> = ({ clubId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'roster' | 'settings'>('inbox');
  const [isLoading, setIsLoading] = useState(true);

  const [club, setClub] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [pendingHours, setPendingHours] = useState<any[]>([]);
  const [actionToast, setActionToast] = useState<{ id: string; action: string; timer: ReturnType<typeof setTimeout>; logData: any } | null>(null);
  const [settingsForm, setSettingsForm] = useState({ description: '', discord: '', instagram: '' });

  useEffect(() => {
    fetchAdminData();
  }, [clubId]);

  const fetchAdminData = async () => {
    try {
      const { data: clubData } = await supabase.from('Clubber').select('*').eq('id', clubId).single();
      if (clubData) {
        setClub(clubData);
        setSettingsForm({
          description: clubData.description || '',
          discord: clubData.social_links?.discord || '',
          instagram: clubData.social_links?.instagram || '',
        });
      }

      const { data: rosterData } = await supabase
        .from('club_members')
        .select('id, role, users(first_name, last_name, email)')
        .eq('club_id', clubId);
      if (rosterData) setRoster(rosterData);

      const { data: inboxData } = await supabase
        .from('activity_logs')
        .select('id, hours, description, activity_date, users(first_name, last_name)')
        .eq('club_id', clubId)
        .eq('status', 'pending');
      if (inboxData) setPendingHours(inboxData);

    } catch (error) {
      console.error('Error loading admin hub', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessHours = (logId: string, action: 'approved' | 'rejected') => {
    const logToProcess = pendingHours.find(l => l.id === logId);
    setPendingHours(prev => prev.filter(l => l.id !== logId));
    if (actionToast) clearTimeout(actionToast.timer);
    const timer = setTimeout(async () => {
      await supabase.from('activity_logs').update({ status: action }).eq('id', logId);
      setActionToast(null);
    }, 5000);
    setActionToast({ id: logId, action, timer, logData: logToProcess });
  };

  const handleUndo = () => {
    if (actionToast) {
      clearTimeout(actionToast.timer);
      setPendingHours(prev => [...prev, actionToast.logData]);
      setActionToast(null);
    }
  };

 const handleUpdateRole = async (memberRowId: string, newRole: string) => {
  // 1. Only run the safety check if someone is being demoted to 'member'
  if (newRole === 'member') {
    
    // Ask Supabase exactly how many admins or owners currently exist in this club
    const { count, error } = await supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId) 
      .in('role', ['admin', 'owner']);

    if (error) {
      console.error('Error checking admin count:', error);
      alert('Failed to verify club permissions.');
      return;
    }

    // Check the current role of the specific person being clicked
    const { data: currentMember } = await supabase
      .from('club_members')
      .select('role')
      .eq('id', memberRowId)
      .single();

    // 2. If the person is currently an admin/owner, AND the total count is 1, BLOCK IT.
    if (currentMember && (currentMember.role === 'admin' || currentMember.role === 'owner')) {
      if (count !== null && count <= 1) {
        alert('Action Blocked: The club must have at least one admin or owner at all times. Appoint someone else first!');
        return; // This completely stops the function right here
      }
    }
  }

  // 3. If they passed the security check (or if they are promoting someone), do the update
  const { error: updateError } = await supabase
    .from('club_members')
    .update({ role: newRole })
    .eq('id', memberRowId);

  if (updateError) {
    console.error('Failed to update role:', updateError);
    alert('Failed to update role.');
  } else {
    fetchAdminData();
  }
};

  const handleKickMember = async (memberRowId: string) => {
    if (window.confirm('Are you sure you want to kick this member?')) {
      await supabase.from('club_members').delete().eq('id', memberRowId);
      fetchAdminData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentTimestamp = new Date().toISOString();
    const { data, error } = await supabase
      .from('Clubber')
      .update({
        description: settingsForm.description,
        social_links: { discord: settingsForm.discord, instagram: settingsForm.instagram },
        updated_at: currentTimestamp,
      })
      .eq('id', clubId)
      .eq('updated_at', club.updated_at)
      .select();

    if (error) alert('Error saving settings.');
    if (data && data.length === 0) {
      alert('⚠️ CONFLICT: Another Admin just updated these settings! Please refresh before making yours.');
    } else {
      alert('Settings saved successfully!');
      setClub({ ...club, updated_at: currentTimestamp });
    }
  };

  const tabClass = (tab: string) =>
    `pb-3 px-5 text-sm font-black border-b-4 uppercase tracking-wide transition-colors ${
      activeTab === tab
        ? 'border-[#FDBB30] text-[#B30838]'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`;

  if (isLoading) return (
    <div className="p-12 text-center text-[#B30838] font-bold">Loading Admin Hub...</div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        <button onClick={onBack} className="text-sm font-bold text-[#B30838] hover:text-[#FDBB30] uppercase tracking-wide transition-colors">
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-[#B30838] p-6 rounded-xl shadow-md border-b-4 border-[#FDBB30] flex justify-between items-end">
          <div>
            <span className="text-xs font-black text-black bg-[#FDBB30] px-3 py-1 rounded uppercase tracking-widest">
              Admin Workspace
            </span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-2">{club?.name}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-300 bg-white rounded-t-lg px-2">
          <button onClick={() => setActiveTab('inbox')} className={tabClass('inbox')}>
            Pending Hours ({pendingHours.length})
          </button>
          <button onClick={() => setActiveTab('roster')} className={tabClass('roster')}>
            Member Roster
          </button>
          <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}>
            Club Settings
          </button>
        </div>

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            {actionToast && (
              <div className="bg-black text-white p-4 rounded-lg shadow-lg flex justify-between items-center border-l-4 border-[#FDBB30]">
                <span className="text-sm">Hours marked as <strong>{actionToast.action}</strong>. Saving in 5s...</span>
                <button onClick={handleUndo} className="bg-[#FDBB30] text-black px-4 py-1 text-sm font-black rounded hover:bg-yellow-400 uppercase">
                  UNDO
                </button>
              </div>
            )}
            {pendingHours.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                You are all caught up! 🦅
              </div>
            ) : (
              pendingHours.map(log => (
                <div key={log.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide">
                      {log.users?.first_name} {log.users?.last_name}
                    </h4>
                    <p className="text-gray-600 text-sm">"{log.description}"</p>
                    <p className="text-xs text-gray-400 mt-1">{log.activity_date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-2xl text-gray-900">
                      {log.hours}<span className="text-sm font-normal text-gray-500">h</span>
                    </span>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleProcessHours(log.id, 'approved')}
                        className="bg-green-50 text-green-700 text-xs font-black px-4 py-2 rounded hover:bg-green-100 uppercase">
                        Approve
                      </button>
                      <button onClick={() => handleProcessHours(log.id, 'rejected')}
                        className="bg-red-50 text-[#B30838] text-xs font-black px-4 py-2 rounded hover:bg-red-100 uppercase">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#B30838]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roster.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{row.users?.first_name} {row.users?.last_name}</div>
                      <div className="text-sm text-gray-500">{row.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-black rounded uppercase ${
                        row.role === 'owner' ? 'bg-[#FDBB30] text-black' :
                        row.role === 'admin' ? 'bg-[#B30838] text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {row.role !== 'owner' && (
                        <div className="flex justify-end gap-2">
                          {row.role === 'member' && (
                            <button onClick={() => handleUpdateRole(row.id, 'admin')}
                              className="text-[#B30838] bg-red-50 border border-[#B30838]/20 px-3 py-1 rounded text-xs font-bold hover:bg-[#B30838] hover:text-white transition-colors">
                              Make Admin
                            </button>
                          )}
                          {row.role === 'admin' && (
                            <button onClick={() => handleUpdateRole(row.id, 'member')}
                              className="text-orange-600 bg-orange-50 px-3 py-1 rounded text-xs font-bold hover:bg-orange-100">
                              Remove Admin
                            </button>
                          )}
                          <button onClick={() => handleKickMember(row.id)}
                            className="text-white bg-[#B30838] px-3 py-1 rounded text-xs font-bold hover:bg-red-900">
                            Kick
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Club Description</label>
                <textarea
                  rows={4}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Discord Link</label>
                  <input
                    type="url"
                    value={settingsForm.discord}
                    onChange={(e) => setSettingsForm({ ...settingsForm, discord: e.target.value })}
                    placeholder="https://discord.gg/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-1">Instagram Link</label>
                  <input
                    type="url"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B30838] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit"
                  className="bg-[#B30838] text-white px-6 py-2 rounded-lg font-black uppercase tracking-wide hover:bg-red-900 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminHubPage;