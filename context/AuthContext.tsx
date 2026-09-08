'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { ApiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role;
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserLocal: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('cadence_token');
        const savedUser = localStorage.getItem('cadence_user');
        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              // ignore JSON parse error
            }
          }
          // Validate and refresh with live backend database
          const me = await ApiClient.getMe();
          if (me) {
            setUser(me);
            localStorage.setItem('cadence_user', JSON.stringify(me));
          }
        }
      } catch {
        // Expired or invalid token
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.login(email, pass);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('cadence_token', res.accessToken);
      localStorage.setItem('cadence_user', JSON.stringify(res.user));
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.register(data);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('cadence_token', res.accessToken);
      localStorage.setItem('cadence_user', JSON.stringify(res.user));
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cadence_token');
    localStorage.removeItem('cadence_user');
  };

  const updateUserLocal = (updated: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('cadence_user', JSON.stringify(merged));
  };

  // Manager and Admin are unified into one role: ADMIN
  const rawRole = user?.role || 'TEAM_MEMBER';
  const role: Role = (rawRole === 'MANAGER' ? 'ADMIN' : rawRole) as Role;
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isManager,
        isLoading,
        login,
        register,
        logout,
        updateUserLocal,
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
