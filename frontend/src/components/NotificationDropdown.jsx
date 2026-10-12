import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-panel shadow-2xl z-50 overflow-hidden border border-slate-700/60 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-sm text-slate-100">Live Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-slate-400 hover:text-brand-300 flex items-center space-x-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-slate-500">Live WebSocket events will appear here in real time</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && markAsRead(item.id)}
              className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-800/40 flex items-start space-x-3 ${
                !item.isRead ? 'bg-brand-950/20' : 'opacity-80'
              }`}
            >
              <div className="mt-1">
                <span
                  className={`block w-2 h-2 rounded-full ${
                    !item.isRead ? 'bg-brand-400 glow-brand-sm' : 'bg-slate-600'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-200 truncate">{item.title}</p>
                  <span className="text-[10px] text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-0.5" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                  </span>
                </div>
                {item.message && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 bg-slate-900/90 text-center border-t border-slate-800">
        <span className="text-[11px] text-slate-500 flex items-center justify-center">
          Powered by Socket.IO WebSocket Gateway
        </span>
      </div>
    </div>
  );
};
