import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'farmer' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ _id: '', name: '', email: '', role: 'customer' }),
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore token on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('authToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        if (stored && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const normalizedUser: User = {
            ...parsedUser,
            role: parsedUser?.role === 'farmer' || parsedUser?.role === 'admin' ? parsedUser.role : 'customer',
          };
          setToken(stored);
          setUser(normalizedUser);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string, role: string) => {
    const res = await api.post('/api/mobile/login', { email, password, role });
    const { token: tk, user: usr } = res.data;
    const normalizedUser: User = {
      ...usr,
      role: usr?.role === 'farmer' || usr?.role === 'admin' ? usr.role : 'customer',
    };
    setToken(tk);
    setUser(normalizedUser);
    await SecureStore.setItemAsync('authToken', tk);
    await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
    return normalizedUser;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    const res = await api.post('/api/mobile/register', { name, email, password, role });
    const { token: tk, user: usr } = res.data;
    setToken(tk);
    setUser(usr);
    await SecureStore.setItemAsync('authToken', tk);
    await SecureStore.setItemAsync('userData', JSON.stringify(usr));
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    } catch {}
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
