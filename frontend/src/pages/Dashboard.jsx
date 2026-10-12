import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckSquare,
  GitBranch,
  Bot,
  Rocket,
  Activity,
  ArrowRight,
  Server,
  Zap,
  Clock,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../context/SocketContext';
import { healthApi } from '../api/client';

export const Dashboard = () => {
  const { user } = useAuth();
  const { organizations, currentOrg, projects, currentProject } = useWorkspace();
  const { isConnected, notifications } = useSocket();

  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      setCheckingHealth(true);
      try {
        const res = await healthApi.check();
        setHealthStatus(res.data);
      } catch (err) {
        setHealthStatus({ status: 'offline', redis: 'disconnected' });
      } finally {
        setCheckingHealth(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Workspace & AI Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0]}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Monitor real-time project metrics, track issues and tasks, synchronize with GitHub repositories, and preview upcoming AI developer assistance.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/projects/issues"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all"
            >
              <span>Manage Issues & Kanban</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/github"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-2"
            >
              <GitBranch className="w-4 h-4 text-brand-400" />
              <span>Connect GitHub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-level KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Organizations</p>
            <p className="text-xl font-bold text-white mt-0.5">{organizations.length}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
              Active: {currentOrg?.name || 'None'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Projects</p>
            <p className="text-xl font-bold text-white mt-0.5">{projects.length}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
              Selected: {currentProject?.name || 'None'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Real-Time Sync</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {isConnected ? 'Active' : 'Offline'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Socket.IO authenticated
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Backend Health</p>
            <p className="text-xl font-bold text-white mt-0.5 uppercase">
              {healthStatus?.status || (checkingHealth ? 'Checking...' : 'Unknown')}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Redis: {healthStatus?.redis || 'n/a'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards & Realtime Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core & Upcoming Features */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            FlowForge Modules & Intelligence
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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  Live API
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                Issue & Task Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Kanban boards with OPEN, IN_PROGRESS, RESOLVED, CLOSED statuses, priority labels, and checklist subtasks.
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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  OAuth & Webhooks
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                GitHub Integration Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect GitHub profile, link repositories to FlowForge projects, and track webhook delivery jobs.
              </p>
            </Link>

            {/* AI Assistant Roadmap UI */}
            <Link
              to="/ai-assistant"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Roadmap AI
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                AI Developer Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                RAG project documentation retrieval, intelligent query answering, and authorized AI tool execution cards.
              </p>
            </Link>

            {/* Deployments Roadmap UI */}
            <Link
              to="/deployments"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                  <Rocket className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Roadmap CI/CD
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Deployment Visibility
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Live deployment pipeline monitoring, multi-environment visibility, build logs console, and rollback actions.
              </p>
            </Link>
          </div>
        </div>

        {/* Real-Time Event Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Live Activity Stream
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>WebSocket Feed</span>
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No recent events</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Real-time events will appear here as tasks and webhooks trigger
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
