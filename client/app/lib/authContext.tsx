import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthAPI } from './api';
import type { AuthLogin, AuthRegister, AuthResponse, User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate user from localStorage on client only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authUser');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res: AuthResponse = await AuthAPI.login({ email, password });
      // Store accessToken and authUser in localStorage
      localStorage.setItem('accessToken', res.data.accessToken);
      if (res.data.user) {
        localStorage.setItem('authUser', JSON.stringify(res.data.user));
      }
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setError(null);
    try {
      const res: AuthResponse = await AuthAPI.register({ email, password, username });
      localStorage.setItem('accessToken', res.data.accessToken);
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
