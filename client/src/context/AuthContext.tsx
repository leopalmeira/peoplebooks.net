import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, VolumeEntitlement } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  entitlements: VolumeEntitlement[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<void>;
  logout: () => void;
  quickSwitch: (role: 'reader' | 'participant' | 'admin' | 'visitor') => Promise<void>;
  hasVolumeAccess: (volumeId: string) => boolean;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('peoplebooks_token'));
  const [entitlements, setEntitlements] = useState<VolumeEntitlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    const storedToken = localStorage.getItem('peoplebooks_token');
    if (!storedToken) {
      setUser(null);
      setEntitlements([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setEntitlements(res.data.entitlements || []);
      }
    } catch {
      localStorage.removeItem('peoplebooks_token');
      setUser(null);
      setToken(null);
      setEntitlements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('peoplebooks_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshMe();
    }
  };

  const register = async (name: string, email: string, password: string, role = 'reader') => {
    const res = await api.register({ name, email, password, role });
    if (res.success && res.data) {
      localStorage.setItem('peoplebooks_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshMe();
    }
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; avatarUrl?: string }) => {
    const res = await api.googleAuth(data);
    if (res.success && res.data) {
      localStorage.setItem('peoplebooks_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshMe();
    }
  };

  const logout = () => {
    localStorage.removeItem('peoplebooks_token');
    setUser(null);
    setToken(null);
    setEntitlements([]);
  };

  const quickSwitch = async (role: 'reader' | 'participant' | 'admin' | 'visitor') => {
    if (role === 'visitor') {
      logout();
      return;
    }

    const credentials = {
      reader: { email: 'leitor@peoplebooks.net', password: 'reader123' },
      participant: { email: 'juliana@peoplebooks.net', password: 'author123' },
      admin: { email: 'admin@peoplebooks.net', password: 'admin123' },
    }[role];

    if (credentials) {
      await login(credentials.email, credentials.password);
    }
  };

  const hasVolumeAccess = (volumeId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return entitlements.some((e) => e.volumeId === volumeId && e.status === 'active');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        entitlements,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        quickSwitch,
        hasVolumeAccess,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

