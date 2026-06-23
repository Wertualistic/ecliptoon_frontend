'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'translator';
  diamond_balance: number;
  avatar: string | null;
  avatar_url?: string | null;
  is_banned: boolean;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, ref?: string | null) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user from storage on mount & trigger a one-time profile refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Refresh user profile once on startup to ensure balance/avatar are fresh
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Accept': 'application/json',
        },
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          // Token expired, logout
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setToken(null);
          setUser(null);
          router.push('/login');
        }
      })
      .then(userData => {
        if (userData) {
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      })
      .catch(err => console.error('Startup user refresh failed:', err));
    }
    setIsLoading(false);
  }, [router]);

  // Sync user profile and balance with API
  const refreshUser = useCallback(async () => {
    const currentToken = token || localStorage.getItem('auth_token');
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else if (res.status === 401) {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  }, [token]);

  // Periodic user balance refresh using a ref to prevent infinite rendering loops
  const refreshUserRef = useRef(refreshUser);
  useEffect(() => {
    refreshUserRef.current = refreshUser;
  }, [refreshUser]);

  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        refreshUserRef.current();
      }, 15000); // refresh every 15s to catch admin approvals
      return () => clearInterval(interval);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Xatolik yuz berdi' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      return { success: false, message: 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.' };
    }
  };

  const register = async (name: string, email: string, password: string, ref?: string | null) => {
    try {
      const res = await fetch(`${API_URL}/auth/register-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password, ref }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.' };
    }
  };

  const registerVerifyCode = async (email: string, code: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Tasdiqlash kodi noto\'g\'ri' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      return { success: false, message: 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.' };
    }
  };

  const logout = async () => {
    const currentToken = token || localStorage.getItem('auth_token');
    if (currentToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Accept': 'application/json',
          },
        });
      } catch (err) {
        console.error('Logout API call error:', err);
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const updateUserBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, diamond_balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        registerVerifyCode,
        logout,
        refreshUser,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
