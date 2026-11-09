import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  Check,
  X,
  UserPlus,
  UserMinus,
  Mail,
  User,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { teamApi, orgApi } from '../api/client';

export const Teams = () => {
  const { currentOrg } = useWorkspace();
  const [teams, setTeams] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create / Edit Team Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);

  // Add Member Modal State
  const [activeTeamForMember, setActiveTeamForMember] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const fetchTeamsAndMembers = async () => {
    if (!currentOrg?.id) return;
    setLoading(true);
    setError('');
    try {
      const [teamsRes, membersRes] = await Promise.all([
        teamApi.list(currentOrg.id),
        orgApi.getMembers(currentOrg.id).catch(() => ({ data: { data: [] } })),
      ]);
      const teamList = teamsRes.data?.data || [];
      setTeams(Array.isArray(teamList) ? teamList : []);
      const memberList = membersRes.data?.data || [];
      setOrgMembers(Array.isArray(memberList) ? memberList : []);
    } catch (err) {
      console.warn('Could not load teams or members:', err);
      setError(err.response?.data?.message || 'Could not fetch teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndMembers();
  }, [currentOrg?.id]);

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDesc('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDesc(team.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    if (!currentOrg?.id) return;
    setSubmitting(true);
    setFormError('');

    try {
      if (editingTeam) {
        await teamApi.update(currentOrg.id, editingTeam.id, {
          name: teamName.trim(),
          description: teamDesc.trim() || undefined,
        });
      } else {
        await teamApi.create(currentOrg.id, {
          name: teamName.trim(),
          description: teamDesc.trim() || undefined,
        });
      }
      setIsModalOpen(false);
      await fetchTeamsAndMembers();
    } catch (err) {
      console.error('Failed to save team:', err);
      setFormError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save team.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamApi.delete(currentOrg.id, teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete team.');
    }
  };

  const handleAddMemberToTeam = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !activeTeamForMember || !currentOrg?.id) return;

    setAddingMember(true);
    setMemberError('');
    try {
      await teamApi.addMember(currentOrg.id, activeTeamForMember.id, selectedUserId);
      setActiveTeamForMember(null);
      setSelectedUserId('');
      await fetchTeamsAndMembers();
    } catch (err) {
      console.error('Failed to add member to team:', err);
      setMemberError(err.response?.data?.message || 'Failed to assign member to team.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      await teamApi.removeMember(currentOrg.id, teamId, userId);
      await fetchTeamsAndMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member from team.');
    }
  };

  const roles = [
    { name: 'ADMIN', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20', desc: 'Full workspace permissions, projects, & settings' },
    { name: 'TEAM_LEAD', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20', desc: 'Manage project milestones, issues, and assignments' },
    { name: 'DEVOPS', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', desc: 'Deployments, GitHub webhooks, & CI/CD pipeline access' },
    { name: 'MEMBER', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', desc: 'Standard developer contributor & issue assignee' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Teams & Access Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
              Live API
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workspace: <span className="text-slate-200 font-semibold">{currentOrg?.name || 'Select Workspace'}</span> • Members: <span className="text-brand-300">{orgMembers.length}</span>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={!currentOrg}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Matrix Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${r.badge}`}>
                {r.name}
              </span>
              <Shield className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-xs text-slate-300">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Organization Teams ({teams.length})</span>
          <span className="text-xs text-slate-500 font-normal">Manage team members and assignments</span>
        </h2>

        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            <span className="text-xs font-mono">Loading teams and membership roster...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-300">No teams found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Create a team (e.g. Backend Platform, Frontend Team, Core Engine) to organize developer tasks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => {
              const members = team.TeamMember || [];
              return (
                <div
                  key={team.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 bg-[#0a0f1e]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(team)}
                          title="Edit Team"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          title="Delete Team"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{team.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {team.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Team Members List */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Members ({members.length})</span>
                        <button
                          onClick={() => {
                            setActiveTeamForMember(team);
                            setSelectedUserId('');
                            setMemberError('');
                          }}
                          className="text-brand-400 hover:text-brand-300 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Assign</span>
                        </button>
                      </div>

                      {members.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">No members assigned yet</p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {members.map((tm) => (
                            <div
                              key={tm.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {tm.user?.name?.[0] || tm.user?.email?.[0] || 'U'}
                                </div>
                                <span className="text-slate-200 font-medium truncate text-[11px]">
                                  {tm.user?.name || tm.user?.email}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveMember(team.id, tm.user?.id || tm.userId)}
                                title="Remove member from team"
                                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>ID: {team.id.slice(0, 8)}...</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 bg-[#0c1222]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingTeam ? 'Edit Team' : 'Create New Team'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTeam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Backend Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Responsibilities, microservice coverage, domain scope..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !teamName.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingTeam ? 'Save Changes' : 'Create Team'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Member Modal */}
      {activeTeamForMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 bg-[#0c1222]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">
                  Assign Member to {activeTeamForMember.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveTeamForMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {memberError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberToTeam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Organization User
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose a workspace member --</option>
                  {orgMembers
                    .filter((m) => {
                      const alreadyInTeam = (activeTeamForMember.TeamMember || []).some(
                        (tm) => tm.userId === m.userId || tm.user?.id === m.userId
                      );
                      return !alreadyInTeam;
                    })
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name || m.user?.email} ({m.role})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Only members not currently assigned to this team are shown.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTeamForMember(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember || !selectedUserId}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  {addingMember ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Assign to Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
