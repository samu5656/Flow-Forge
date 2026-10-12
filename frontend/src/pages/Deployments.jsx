import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Terminal,
  ExternalLink,
  ChevronDown,
  Server,
  Layers,
  ShieldCheck,
  Check,
  X,
  FileCode,
  Globe,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const Deployments = () => {
  const { currentProject } = useWorkspace();

  const [activeEnv, setActiveEnv] = useState('ALL');
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const [deployments, setDeployments] = useState([
    {
      id: 'dep_prod_9482',
      environment: 'Production',
      branch: 'main',
      commit: '7b2a41d',
      message: 'feat: add BullMQ worker for webhook queue handling',
      status: 'SUCCESS',
      time: '12m ago',
      duration: '42s',
      url: 'https://flowforge.internal',
      author: 'alex-mercer',
      logs: `[2026-10-11T06:10:01Z] [Docker] Building container flowforge_api:latest
[2026-10-11T06:10:08Z] [Prisma] Running prisma migrate deploy... Done (0 migrations applied)
[2026-10-11T06:10:14Z] [Node] Starting Express HTTP server on port 5000...
[2026-10-11T06:10:18Z] [Redis] Connected to Redis cluster at 127.0.0.1:6379
[2026-10-11T06:10:22Z] [BullMQ] Workers initialized for emailQueue and webhookQueue
[2026-10-11T06:10:35Z] [HealthCheck] GET /health responded with 200 OK
[2026-10-11T06:10:42Z] [Success] Container healthy. Deployed to production cluster.`,
    },
    {
      id: 'dep_stag_1029',
      environment: 'Staging',
      branch: 'frontend-feat',
      commit: '9c4f12e',
      message: 'feat: initialize FlowForge React frontend shell',
      status: 'BUILDING',
      time: 'Just now',
      duration: '18s',
      url: 'https://staging.flowforge.internal',
      author: 'dev-team',
      logs: `[2026-10-11T06:18:12Z] [Vite] Building for production...
[2026-10-11T06:18:18Z] [Vite] Transforming 1693 modules...
[2026-10-11T06:18:24Z] [Vite] Rendering chunks...
[2026-10-11T06:18:30Z] [Vite] Computing gzip size...`,
    },
    {
      id: 'dep_prev_3321',
      environment: 'Preview',
      branch: 'fix/auth-cookie',
      commit: '3a18ef0',
      message: 'fix: align sameSite lax cookie options',
      status: 'SUCCESS',
      time: '2h ago',
      duration: '35s',
      url: 'https://pr-12.preview.flowforge.internal',
      author: 'samu5656',
      logs: `[2026-10-11T04:20:01Z] [Preview] Spinning up ephemeral container
[2026-10-11T04:20:15Z] [Test] Supertest API tests passed (14/14 suites)
[2026-10-11T04:20:35Z] [Preview] Ready at https://pr-12.preview.flowforge.internal`,
    },
  ]);

  const handleTriggerBuild = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const newDep = {
        id: `dep_prod_${Math.random().toString(16).substring(2, 6)}`,
        environment: 'Staging',
        branch: 'frontend-feat',
        commit: 'a1b2c3d',
        message: 'ci: manual trigger from FlowForge dashboard',
        status: 'SUCCESS',
        time: 'Just now',
        duration: '22s',
        url: 'https://staging.flowforge.internal',
        author: 'developer',
        logs: `[Build Trigger] Manual pipeline dispatched
[Docker] Verified Dockerfile multi-stage build
[Health] All microservices responded healthy (200 OK)
[Success] Deployment published successfully!`,
      };
      setDeployments((prev) => [newDep, ...prev]);
      setIsBuilding(false);
    }, 1200);
  };

  const handleRollback = (dep) => {
    if (!window.confirm(`Initiate rollback to commit ${dep.commit}?`)) return;
    alert(`Rollback signal dispatched to Nginx reverse proxy for environment ${dep.environment}.`);
  };

  const filteredDeployments = deployments.filter((d) => {
    if (activeEnv === 'ALL') return true;
    return d.environment.toUpperCase() === activeEnv;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Deployment Visibility & CI/CD Pipelines</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Roadmap Feature
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-environment tracking across Production, Staging, and Preview branches for <span className="text-emerald-300 font-semibold">{currentProject?.name || 'FlowForge'}</span>.
          </p>
        </div>

        <button
          onClick={handleTriggerBuild}
          disabled={isBuilding}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          {isBuilding ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isBuilding ? 'Building Pipeline...' : 'Trigger Manual Build'}</span>
        </button>
      </div>

      {/* Environments status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          </div>
          <p className="text-base font-bold text-white">v1.0.4 Deployed</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>branch: main</span>
            <span className="text-emerald-400">99.98% Uptime</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Staging</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400" />
          </div>
          <p className="text-base font-bold text-white">frontend-feat Active</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>branch: frontend-feat</span>
            <span className="text-blue-400">CI Tests Passing</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Docker Compose</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <p className="text-base font-bold text-white">4 Containers Up</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>api, redis, worker, pg</span>
            <span className="text-purple-300">Port 5000</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {['ALL', 'PRODUCTION', 'STAGING', 'PREVIEW'].map((env) => (
          <button
            key={env}
            onClick={() => setActiveEnv(env)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeEnv === env
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {env}
          </button>
        ))}
      </div>

      {/* Deployments History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Pipeline Deployments
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Click row to view container build logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-6">Environment</th>
                <th className="py-3 px-6">Commit & Message</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Deployed</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
              {filteredDeployments.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDeployment(d)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-6 font-semibold text-white">
                    <span className="flex items-center space-x-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          d.environment === 'Production'
                            ? 'bg-emerald-400'
                            : d.environment === 'Staging'
                            ? 'bg-blue-400'
                            : 'bg-purple-400'
                        }`}
                      />
                      <span>{d.environment}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-brand-300 text-[11px] bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                        {d.commit}
                      </span>
                      <span className="truncate max-w-xs">{d.message}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400">{d.author}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        d.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {d.status === 'SUCCESS' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      <span>{d.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400">{d.duration}</td>
                  <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">{d.time}</td>
                  <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRollback(d)}
                      title="Rollback to this revision"
                      className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Build Logs Drawer Modal */}
      {selectedDeployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Build Logs — {selectedDeployment.environment} ({selectedDeployment.commit})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeployment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {selectedDeployment.logs}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Domain: {selectedDeployment.url}</span>
              <button
                onClick={() => setSelectedDeployment(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
