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
  const [isConvexReady, setIsConvexReady] = useState(false);

  // Check if we're in a Convex provider context
  useEffect(() => {
    // Check if Convex is available immediately, then set a shorter fallback
    const checkConvex = () => {
      try {
        // Try to access Convex API to see if it's available
        if (typeof api !== 'undefined') {
          setIsConvexReady(true);
          return;
        }
      } catch (error) {
        // Convex not ready yet
      }
      
      // Fallback timer with shorter delay
      const timer = setTimeout(() => {
        setIsConvexReady(true);
      }, 50);
      return timer;
    };

    const timer = checkConvex();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Only use Convex hooks when ready and available
  let loginMutation, registerMutation, logoutMutation, currentUser;
  let isInConvexProvider = false;
  
  try {
    // Check if we're inside a ConvexProvider by trying to use a hook
    const testHook = useMutation;
    isInConvexProvider = true;
    
    loginMutation = isConvexReady ? useMutation(api.auth.loginUser) : null;
    registerMutation = isConvexReady ? useMutation(api.auth.registerUser) : null;
    logoutMutation = isConvexReady ? useMutation(api.auth.logoutUser) : null;
    
    // Verify session on mount (only when Convex is ready)
    currentUser = isConvexReady && sessionToken 
      ? useQuery(api.auth.getCurrentUser, { token: sessionToken })
      : undefined;
  } catch (error) {
    // Not in ConvexProvider or Convex not available
    isInConvexProvider = false;
    loginMutation = null;
    registerMutation = null;
    logoutMutation = null;
    currentUser = undefined;
  }

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
    if (currentUser !== undefined) {
      setUser(currentUser);
      setIsLoading(false);
    } else if (isConvexReady && !sessionToken) {
      // If Convex is ready but no session token, stop loading
      setIsLoading(false);
    }
  }, [currentUser, isConvexReady, sessionToken]);

  const login = async (email: string, password: string) => {
    if (!loginMutation || !isConvexReady) {
      throw new Error('Authentication service not available. Please try again in a moment.');
    }
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
    if (!registerMutation || !isConvexReady) {
      throw new Error('Registration service not available. Please try again in a moment.');
    }
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
    // Check if we're on the client side and wait a bit longer
    if (typeof window !== 'undefined') {
      // Return a more user-friendly loading state
      return {
        user: null,
        token: null,
        login: async () => { 
          throw new Error('Please wait a moment for the system to initialize, then try again.'); 
        },
        register: async () => { 
          throw new Error('Please wait a moment for the system to initialize, then try again.'); 
        },
        logout: async () => { 
          console.warn('Auth system not ready yet');
        },
        isLoading: true,
      };
    }
    
    // Server-side fallback
    return {
      user: null,
      token: null,
      login: async () => { 
        throw new Error('Authentication not available on server side.'); 
      },
      register: async () => { 
        throw new Error('Authentication not available on server side.'); 
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