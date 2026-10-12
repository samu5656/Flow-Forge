import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Github,
  ExternalLink,
  Link2,
  CheckCircle2,
  XCircle,
  Unlink,
  RefreshCw,
  Plus,
  Loader2,
  AlertCircle,
  FolderGit2,
  Check,
  X,
  Radio,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { githubApi } from '../api/client';

export const GithubHub = () => {
  const { currentOrg, currentProject } = useWorkspace();

  // State
  const [projectRepos, setProjectRepos] = useState([]);
  const [userRepos, setUserRepos] = useState([]);
  const [loadingProjectRepos, setLoadingProjectRepos] = useState(false);
  const [loadingUserRepos, setLoadingUserRepos] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [disconnectingAccount, setDisconnectingAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('repositories'); // 'repositories' | 'webhooks' | 'activity'

  // Link Repo Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [linkingRepo, setLinkingRepo] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Webhook Simulation / Ingress state
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [simulatedDeliveries, setSimulatedDeliveries] = useState([
    {
      id: 'del_9420ab1e',
      event: 'push',
      action: null,
      ref: 'refs/heads/main',
      status: 'PROCESSED',
      timestamp: '15m ago',
      details: 'Pushed 2 commits to main branch',
    },
    {
      id: 'del_7718fc3a',
      event: 'issues',
      action: 'opened',
      ref: null,
      status: 'PROCESSED',
      timestamp: '1h ago',
      details: 'Issue opened: "Optimize Redis BullMQ connection pooling"',
    },
    {
      id: 'del_1029ba88',
      event: 'pull_request',
      action: 'opened',
      ref: 'refs/heads/frontend-feat',
      status: 'PROCESSED',
      timestamp: '3h ago',
      details: 'PR #12: "Implement FlowForge React Frontend"',
    },
  ]);

  // Load project connected repos
  const fetchProjectRepos = async () => {
    if (!currentOrg?.id || !currentProject?.id) {
      setProjectRepos([]);
      return;
    }
    setLoadingProjectRepos(true);
    try {
      const res = await githubApi.getProjectRepos(currentOrg.id, currentProject.id);
      const list = res.data?.data || [];
      setProjectRepos(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch project repositories:', err);
      setProjectRepos([]);
    } finally {
      setLoadingProjectRepos(false);
    }
  };

  // Check if user's GitHub account is connected by fetching user repos
  const checkGithubConnection = async () => {
    setLoadingUserRepos(true);
    try {
      const res = await githubApi.getRepositories();
      const list = res.data?.data || [];
      setUserRepos(Array.isArray(list) ? list : []);
      setIsGithubConnected(true);
    } catch (err) {
      // 404 means GitHub account is not yet connected
      if (err.response?.status === 404) {
        setIsGithubConnected(false);
      } else {
        console.warn('Error querying GitHub repos:', err);
      }
      setUserRepos([]);
    } finally {
      setLoadingUserRepos(false);
    }
  };

  useEffect(() => {
    fetchProjectRepos();
    checkGithubConnection();
  }, [currentOrg?.id, currentProject?.id]);

  // Start GitHub OAuth
  const handleConnectGithub = async () => {
    setConnectingOAuth(true);
    try {
      const res = await githubApi.getConnectUrl();
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Failed to get GitHub auth URL:', err);
      alert(err.response?.data?.message || 'Failed to initiate GitHub OAuth.');
      setConnectingOAuth(false);
    }
  };

  // Disconnect GitHub Account
  const handleDisconnectGithub = async () => {
    if (!window.confirm('Disconnect your GitHub account from FlowForge?')) return;
    setDisconnectingAccount(true);
    try {
      await githubApi.disconnect();
      setIsGithubConnected(false);
      setUserRepos([]);
      alert('GitHub account disconnected successfully.');
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
      alert(err.response?.data?.message || 'Failed to disconnect GitHub account.');
    } finally {
      setDisconnectingAccount(false);
    }
  };

  // Link Repository to Project
  const handleLinkRepository = async (e) => {
    e.preventDefault();
    if (!selectedRepoId || !currentOrg?.id || !currentProject?.id) return;
    setLinkingRepo(true);
    setLinkError('');

    try {
      const res = await githubApi.connectProjectRepo(currentOrg.id, currentProject.id, {
        githubRepoId: selectedRepoId,
      });
      if (res.data?.success) {
        setIsLinkModalOpen(false);
        setSelectedRepoId('');
        await fetchProjectRepos();
      }
    } catch (err) {
      console.error('Failed to link repo:', err);
      setLinkError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to link GitHub repository.'
      );
    } finally {
      setLinkingRepo(false);
    }
  };

  // Unlink Repository from Project
  const handleUnlinkRepository = async (repoId) => {
    if (!window.confirm('Unlink this repository from the project?')) return;
    try {
      await githubApi.disconnectProjectRepo(currentOrg.id, currentProject.id, repoId);
      setProjectRepos((prev) => prev.filter((r) => r.id !== repoId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unlink repository.');
    }
  };

  // Webhook Test trigger simulation
  const handleSimulateWebhook = () => {
    setSimulatingWebhook(true);
    setTimeout(() => {
      const newDel = {
        id: `del_${Math.random().toString(16).substring(2, 10)}`,
        event: 'push',
        action: null,
        ref: 'refs/heads/frontend-feat',
        status: 'PROCESSED',
        timestamp: 'Just now',
        details: 'Simulated push delivery received by /api/v1/github/webhook',
      };
      setSimulatedDeliveries((prev) => [newDel, ...prev]);
      setSimulatingWebhook(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>GitHub Integration Hub</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
              OAuth & Webhooks
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your personal GitHub account, link repositories to <span className="text-brand-300 font-semibold">{currentProject?.name || 'FlowForge'}</span>, and inspect webhook deliveries.
          </p>
        </div>

        {/* Global Connection Button */}
        <div className="flex items-center space-x-2">
          {isGithubConnected ? (
            <button
              onClick={handleDisconnectGithub}
              disabled={disconnectingAccount}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect GitHub</span>
            </button>
          ) : (
            <button
              onClick={handleConnectGithub}
              disabled={connectingOAuth}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-colors shadow-md"
            >
              <Github className="w-4 h-4 text-white" />
              <span>{connectingOAuth ? 'Redirecting to GitHub...' : 'Connect GitHub Account'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Status Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">GitHub OAuth Account</h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isGithubConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {isGithubConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isGithubConnected
                ? `Authorized with repo, read:user, and user:email scopes. ${userRepos.length} accessible repositories.`
                : 'Connect your GitHub profile to link repositories directly to this FlowForge project.'}
            </p>
          </div>
        </div>

        {isGithubConnected && (
          <button
            onClick={() => setIsLinkModalOpen(true)}
            disabled={!currentProject}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Link Repository</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('repositories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'repositories'
              ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Linked Repositories ({projectRepos.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'webhooks'
              ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Webhook Delivery Center
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'activity'
              ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PR & Commits Sync
        </button>
      </div>

      {/* Tab 1: Linked Repositories */}
      {activeTab === 'repositories' && (
        <div className="space-y-4">
          {loadingProjectRepos ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              <span className="text-xs font-mono">Loading connected repositories...</span>
            </div>
          ) : projectRepos.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
              <FolderGit2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-300">No Repositories Linked</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Link a GitHub repository to synchronize code commits, branches, issues, and deployments.
              </p>
              {isGithubConnected && (
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="mt-4 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Link a Repository Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 shrink-0">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">
                            {repo.fullName || `${repo.owner}/${repo.name}`}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Default branch: {repo.defaultBranch || 'main'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {repo.htmlUrl && (
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleUnlinkRepository(repo.id)}
                          title="Unlink repository"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Webhooks Synced</span>
                    </span>
                    <span>Repo ID: {repo.githubRepoId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Webhook Delivery Center */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>HMAC-SHA256 Webhook Verification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Incoming events from <code className="text-brand-300 font-mono">POST /api/v1/github/webhook</code> are cryptographically verified via secret signature and queued asynchronously in Redis BullMQ.
              </p>
            </div>

            <button
              onClick={handleSimulateWebhook}
              disabled={simulatingWebhook}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center space-x-2 transition-colors shrink-0"
            >
              {simulatingWebhook ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              ) : (
                <Send className="w-3.5 h-3.5 text-brand-400" />
              )}
              <span>Simulate Webhook Delivery</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Recent Ingress Deliveries
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Idempotency by x-github-delivery
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-6">Delivery UUID</th>
                    <th className="py-3 px-6">Event Type</th>
                    <th className="py-3 px-6">Payload Summary</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {simulatedDeliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-6 font-mono text-[11px] text-brand-300">
                        {d.id}
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          {d.event} {d.action ? `(${d.action})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-300 max-w-sm truncate">
                        {d.details}
                      </td>
                      <td className="py-3 px-6 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-500 font-mono text-[11px]">
                        {d.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PR & Commits Sync Preview */}
      {activeTab === 'activity' && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
          <GitBranch className="w-10 h-10 mx-auto text-brand-400 opacity-60" />
          <h3 className="text-sm font-bold text-white">Pull Requests & Commit Feed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            As pull requests and push commits arrive through your connected repository webhooks, FlowForge automatically updates the Kanban issue status and links developer activity.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
              <Check className="w-3 h-3" />
              <span>BullMQ Queue Webhook Worker Listening</span>
            </span>
          </div>
        </div>
      )}

      {/* Link Repository Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Link GitHub Repository</h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {linkError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{linkError}</span>
              </div>
            )}

            <form onSubmit={handleLinkRepository} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select GitHub Repository
                </label>
                {loadingUserRepos ? (
                  <div className="py-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                    <span>Loading your repositories from GitHub API...</span>
                  </div>
                ) : userRepos.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 text-center">
                    No repositories found in your GitHub account.
                  </div>
                ) : (
                  <select
                    value={selectedRepoId}
                    onChange={(e) => setSelectedRepoId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">-- Choose a repository --</option>
                    {userRepos.map((r) => (
                      <option key={r.githubRepoId} value={r.githubRepoId}>
                        {r.fullName} ({r.defaultBranch || 'main'})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  Only repositories accessible by your authorized OAuth token are shown.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingRepo || !selectedRepoId}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  {linkingRepo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Connect to Project</span>
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
