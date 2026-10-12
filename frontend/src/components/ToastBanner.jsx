import React from 'react';
import { Bell, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const ToastBanner = () => {
  const { activeToast, dismissToast } = useSocket();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="p-4 rounded-xl glass-panel border border-brand-500/40 glow-brand bg-slate-900/90 shadow-2xl flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-100 truncate">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {activeToast.message}
          </p>
          <span className="text-[10px] text-brand-300 mt-1 inline-block">
            ⚡ Real-time WebSocket Event
          </span>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
