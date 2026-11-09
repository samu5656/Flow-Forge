import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckSquare,
  GitBranch,
  Bot,
  Rocket,
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../context/SocketContext';
import { issueApi, teamApi } from '../api/client';

export const Dashboard = () => {
  const { user } = useAuth();
  const { organizations, currentOrg, projects, currentProject } = useWorkspace();
  const { notifications } = useSocket();

  const [issueCount, setIssueCount] = useState(null);
  const [memberCount, setMemberCount] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (currentOrg?.id && currentProject?.id) {
        try {
          const res = await issueApi.list(currentOrg.id, currentProject.id);
          const list = res.data?.data || [];
          setIssueCount(Array.isArray(list) ? list.length : 0);
        } catch (e) {
          setIssueCount(0);
        }
      } else {
        setIssueCount(null);
      }

      if (currentOrg?.id) {
        try {
          const res = await teamApi.list(currentOrg.id);
          const list = res.data?.data || [];
          setMemberCount(Array.isArray(list) ? list.length : 1);
        } catch (e) {
          setMemberCount(1);
        }
      } else {
        setMemberCount(null);
      }
    };

    fetchStats();
  }, [currentOrg?.id, currentProject?.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Collaborative Project Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0]}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Monitor project milestones, organize deliverables, collaborate with your team, and interact with your AI project assistant.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/projects/issues"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all"
            >
              <span>View Tasks & Kanban</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/github"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-2"
            >
              <GitBranch className="w-4 h-4 text-brand-400" />
              <span>GitHub Integration</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-level Client KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Organizations */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Organizations</p>
            <p className="text-xl font-bold text-white mt-0.5">{organizations.length}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Active: {currentOrg?.name || 'None'}
            </p>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Projects</p>
            <p className="text-xl font-bold text-white mt-0.5">{projects.length}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Selected: {currentProject?.name || 'None'}
            </p>
          </div>
        </div>

        {/* Card 3: Tasks & Issues */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tasks & Issues</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {issueCount !== null ? issueCount : '0'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {currentProject?.name ? `In ${currentProject.name}` : 'Select a project'}
            </p>
          </div>
        </div>

        {/* Card 4: Team Members */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Team Members</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {memberCount !== null ? memberCount : '1'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              {currentOrg ? `${currentOrg.name} Roster` : 'Collaborators'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Modules */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Workspace Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issues & Kanban */}
            <Link
              to="/projects/issues"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                Tasks & Workflow Management
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Organize tasks, manage progress across Kanban stages, set priorities, and track deliverables.
              </p>
            </Link>

            {/* GitHub Hub */}
            <Link
              to="/github"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                  <GitBranch className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                GitHub Repository Integration
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect your GitHub repository to automatically synchronize code commits, pull requests, and activity.
              </p>
            </Link>

            {/* AI Assistant */}
            <Link
              to="/ai-assistant"
              className="glass-panel p-5 rounded-2xl border border-purple-500/30 hover:border-purple-500/60 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                AI Project Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ask questions about your project, query uploaded guidelines, analyze issue progress, and draft action items.
              </p>
            </Link>

            {/* Deployments Visibility */}
            <Link
              to="/deployments"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                  <Rocket className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Releases & Deployments
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                View project release history, active environments, recent updates, and deployment status.
              </p>
            </Link>
          </div>
        </div>

        {/* Real-Time Event Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Recent Activity
            </h2>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Updates</span>
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No recent events</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Updates and notifications will appear here as your team collaborates
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
