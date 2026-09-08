'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { ApiClient } from '../lib/api';
import { MOCK_USERS } from '../lib/mock-data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role;
  isManager: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchUser: (key: 'alex' | 'sarah' | 'dana' | 'marcus') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default demo user: Alex Chen (Team Member)
  const [user, setUser] = useState<User | null>(MOCK_USERS[1]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('cadence_token');
    const savedUser = localStorage.getItem('cadence_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // use default mock
      }
    }
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
      // If server is not yet running, use local mock user
      const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        setToken('mock-jwt-token');
        localStorage.setItem('cadence_user', JSON.stringify(matched));
      } else {
        throw err;
      }
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
    } catch (err) {
      // Mock register
      const newUser: User = {
        id: `u-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        role: data.role || 'TEAM_MEMBER',
        department: data.department || 'Engineering',
        title: data.role === 'MANAGER' ? 'Engineering Manager' : 'Software Engineer',
        avatarColor: '#ec3013',
        active: true,
      };
      setUser(newUser);
      setToken('mock-jwt-token');
      localStorage.setItem('cadence_user', JSON.stringify(newUser));
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

  // Header switcher between roles for live demos
  const switchUser = (key: 'alex' | 'sarah' | 'dana' | 'marcus') => {
    const userMap: Record<string, User> = {
      alex: MOCK_USERS[1],
      sarah: MOCK_USERS[0],
      dana: MOCK_USERS[2],
      marcus: MOCK_USERS[3],
    };
    const target = userMap[key] || MOCK_USERS[1];
    setUser(target);
    localStorage.setItem('cadence_user', JSON.stringify(target));
  };

  const role = user?.role || 'TEAM_MEMBER';
  const isManager = role === 'MANAGER' || role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isManager,
        isLoading,
        login,
        register,
        logout,
        switchUser,
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
