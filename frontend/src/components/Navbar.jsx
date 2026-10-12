import React, { useState } from 'react';
import {
  Bell,
  Search,
  Wifi,
  WifiOff,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { isConnected, unreadCount } = useSocket();
  const { currentOrg, currentProject } = useWorkspace();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1d]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-500 font-mono flex items-center space-x-1">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>workspace</span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-medium text-slate-300">
          {currentOrg ? currentOrg.name : 'FlowForge Hub'}
        </span>
        {currentProject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {currentProject.name}
            </span>
          </>
        )}
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center space-x-4">
        {/* Real-time Socket status indicator */}
        <div
          title={isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span>{isConnected ? 'Real-Time Sync' : 'Offline'}</span>
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 glow-brand-sm" />
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* User Quick Profile Link */}
        <Link
          to="/profile"
          className="text-xs text-slate-400 hover:text-brand-300 transition-colors font-medium border-l border-slate-800 pl-4"
        >
          Settings
        </Link>
      </div>
    </header>
  );
};
