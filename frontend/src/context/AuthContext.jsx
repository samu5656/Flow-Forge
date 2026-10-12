import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ff_token'));
  const [loading, setLoading] = useState(true);

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ff_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ff_user');
    }
  }, [user]);

  // Load current user on initial mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ff_token');
      if (storedToken) {
        try {
          const res = await authApi.me();
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('Failed to verify session:', err?.message);
          // If token verification fails, reset
          if (err.response?.status === 401) {
            localStorage.removeItem('ff_token');
            localStorage.removeItem('ff_user');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, accessToken } = res.data.data;
    localStorage.setItem('ff_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateAvatar = async (formData) => {
    const res = await authApi.uploadAvatar(formData);
    if (res.data?.success && res.data?.data?.avatarUrl) {
      setUser((prev) => ({
        ...prev,
        avatarUrl: res.data.data.avatarUrl,
      }));
    }
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateAvatar,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
