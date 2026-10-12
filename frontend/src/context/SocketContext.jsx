import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected to FlowForge server:', newSocket.id);
      if (user?.id) {
        newSocket.emit('authenticate', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected from server');
    });

    // Real-time notification received from backend
    newSocket.on('new_notification', (data) => {
      console.log('[Socket] Received new notification:', data);
      const formatted = {
        id: data.id || `notif_${Date.now()}`,
        title: data.title || 'New Notification',
        message: data.message || '',
        createdAt: data.createdAt || new Date().toISOString(),
        isRead: false,
      };

      setNotifications((prev) => [formatted, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger temporary in-app banner toast
      setActiveToast(formatted);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
    });

    setSocket(newSocket);

    // Initial fetch of notifications
    fetchNotifications();

    return () => {
      newSocket.disconnect();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [isAuthenticated, user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.list();
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setNotifications(res.data.data);
        const unread = res.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Could not fetch existing notifications:', err?.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const item of unread) {
      try {
        await notificationApi.markAsRead(item.id);
      } catch (err) {
        // continue
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        activeToast,
        markAsRead,
        markAllAsRead,
        dismissToast,
        fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
