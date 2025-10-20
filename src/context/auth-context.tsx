'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ userId: string; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.auth.loginUser);
  const registerMutation = useMutation(api.auth.registerUser);
  const logoutMutation = useMutation(api.auth.logoutUser);
  
  // Verify session on mount
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    sessionToken ? { token: sessionToken } : 'skip'
  );

  useEffect(() => {
    // Check for existing session token
    const token = localStorage.getItem('sessionToken');
    if (token) {
      setSessionToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser);
      setIsLoading(false);
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password });
      setSessionToken(result.sessionToken);
      setUser(result.user);
      localStorage.setItem('sessionToken', result.sessionToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await registerMutation(data);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (sessionToken) {
      try {
        await logoutMutation({ token: sessionToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('sessionToken');
  };

  return (
    <AuthContext.Provider value={{ user, token: sessionToken, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}