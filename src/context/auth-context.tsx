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

  // These hooks will only be called when we're inside a ConvexProvider
  const loginMutation = useMutation(api.auth.loginUser);
  const registerMutation = useMutation(api.auth.registerUser);
  const logoutMutation = useMutation(api.auth.logoutUser);
  const currentUser = useQuery(
    api.auth.getCurrentUser, 
    sessionToken ? { token: sessionToken } : 'skip'
  );

  useEffect(() => {
    // Check for existing session token (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sessionToken');
      if (token) {
        setSessionToken(token);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing session token on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sessionToken');
      if (token) {
        setSessionToken(token);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser);
      setIsLoading(false);
    } else if (!sessionToken) {
      setIsLoading(false);
    }
  }, [currentUser, sessionToken]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password });
      setSessionToken(result.sessionToken);
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', result.sessionToken);
      }
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
    if (sessionToken && logoutMutation) {
      try {
        await logoutMutation({ token: sessionToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    setSessionToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
    }
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
    // Return a safe fallback when context is not available
    return {
      user: null,
      token: null,
      login: async () => { 
        throw new Error('Authentication service is not available. Please refresh the page.'); 
      },
      register: async () => { 
        throw new Error('Authentication service is not available. Please refresh the page.'); 
      },
      logout: async () => {},
      isLoading: false,
    };
  }
  return context;
}

export function useAuthSafe() {
  try {
    return useAuth();
  } catch (error) {
    return {
      user: null,
      token: null,
      login: async () => { 
        console.warn('Auth system not available');
        throw new Error('Authentication system is not available. Please refresh the page.'); 
      },
      register: async () => { 
        console.warn('Auth system not available');
        throw new Error('Authentication system is not available. Please refresh the page.'); 
      },
      logout: async () => { 
        console.warn('Auth system not available');
      },
      isLoading: false,
    };
  }
}