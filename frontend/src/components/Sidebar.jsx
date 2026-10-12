import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Milestone,
  Tag,
  Users,
  GitBranch,
  Bot,
  Rocket,
  Activity,
  User,
  LogOut,
  ChevronDown,
  Building2,
  FolderGit2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { CreateOrgModal } from './CreateOrgModal';
import { CreateProjectModal } from './CreateProjectModal';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const {
    organizations,
    currentOrg,
    projects,
    currentProject,
    switchOrg,
    switchProject,
  } = useWorkspace();
  const navigate = useNavigate();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Issues & Kanban', path: '/projects/issues', icon: CheckSquare },
    { name: 'Milestones', path: '/milestones', icon: Milestone },
    { name: 'Labels', path: '/labels', icon: Tag },
    { name: 'Teams & Roles', path: '/teams', icon: Users },
    { name: 'GitHub Sync', path: '/github', icon: GitBranch },
  ];

  const futureLinks = [
    {
      name: 'AI Copilot',
      path: '/ai-assistant',
      icon: Bot,
      badge: 'AI RAG',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      name: 'Deployments',
      path: '/deployments',
      icon: Rocket,
      badge: 'CI/CD',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Observability',
      path: '/observability',
      icon: Activity,
      badge: 'Health',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center glow-brand-sm text-white font-black text-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center space-x-1.5">
              <span>FlowForge</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
                v1.0
              </span>
            </span>
            <span className="text-[11px] text-slate-400">Developer Platform</span>
          </div>
        </div>

        {/* Organization Switcher */}
        <div className="p-3 border-b border-slate-800/50 space-y-2">
          <div className="relative">
            <button
              onClick={() => {
                setOrgDropdownOpen(!orgDropdownOpen);
                setProjectDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 text-left transition-all text-xs"
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Workspace</p>
                  <p className="text-slate-200 font-medium truncate">
                    {currentOrg ? currentOrg.name : 'Select Workspace'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <span>Workspaces</span>
                  <button
                    onClick={() => {
                      setOrgDropdownOpen(false);
                      setIsOrgModalOpen(true);
                    }}
                    className="text-brand-400 hover:text-brand-300 flex items-center space-x-0.5 lowercase font-normal"
                  >
                    <Plus className="w-3 h-3" />
                    <span>new</span>
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrg(org);
                        setOrgDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        currentOrg?.id === org.id
                          ? 'text-brand-300 font-semibold bg-brand-950/30'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{org.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{org.slug}</span>
                    </button>
                  ))}
                  {organizations.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-500 italic">No workspaces found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Project Switcher */}
          {currentOrg && (
            <div className="relative">
              <button
                onClick={() => {
                  setProjectDropdownOpen(!projectDropdownOpen);
                  setOrgDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 text-left transition-all text-xs"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FolderGit2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Project</p>
                    <p className="text-slate-200 font-medium truncate">
                      {currentProject ? currentProject.name : 'Select Project'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {projectDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <span>Projects</span>
                    <button
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        setIsProjectModalOpen(true);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 lowercase font-normal"
                    >
                      <Plus className="w-3 h-3" />
                      <span>new</span>
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          switchProject(proj);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          currentProject?.id === proj.id
                            ? 'text-emerald-300 font-semibold bg-emerald-950/30'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{proj.slug}</span>
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500 italic">No projects yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Workspace Core
            </p>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Intelligence & DevOps</span>
              <span className="text-[9px] text-brand-400">Roadmap</span>
            </p>
            <nav className="space-y-1">
              {futureLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <Link
              to="/profile"
              className="flex items-center space-x-2.5 min-w-0 group hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate group-hover:text-brand-300 transition-colors">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Workspace Creation Modals */}
      <CreateOrgModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};
