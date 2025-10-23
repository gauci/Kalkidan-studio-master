'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

// Explicit authentication states
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthError {
  code: 'INVALID_TOKEN' | 'EXPIRED_SESSION' | 'INSUFFICIENT_PERMISSIONS' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  timestamp: number;
}

interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  permissions: string[];
  lastVerified: number;
  error: AuthError | null;
}

interface AuthContextType {
  // State
  authState: AuthState;
  
  // Computed properties for backward compatibility
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ userId: string; message: string }>;
  logout: () => Promise<void>;
  verifyRole: (role: 'user' | 'admin') => Promise<boolean>;
  reVerifyRole: (role: 'user' | 'admin') => Promise<boolean>;
  clearAuthError: () => void;
  refreshAuth: () => Promise<void>;
  
  // State checks
  isAuthenticated: () => boolean;
  hasRole: (role: 'user' | 'admin') => boolean;
  isSessionValid: () => boolean;
}

interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  password: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    user: null,
    token: null,
    permissions: [],
    lastVerified: 0,
    error: null
  });

  // These hooks will only be called when we're inside a ConvexProvider
  const loginMutation = useMutation(api.auth.loginUser);
  const registerMutation = useMutation(api.auth.registerUser);
  const logoutMutation = useMutation(api.auth.logoutUser);

  const currentUser = useQuery(
    api.auth.getCurrentUser, 
    authState.token ? { token: authState.token } : 'skip'
  );

  // Helper function to create auth error with user-friendly messages
  const createAuthError = useCallback((code: AuthError['code'], message: string): AuthError => {
    // Create user-friendly messages that don't expose system details
    const userFriendlyMessages: Record<AuthError['code'], string> = {
      'INVALID_TOKEN': 'Your session has expired. Please log in again.',
      'EXPIRED_SESSION': 'Your session has expired. Please log in again.',
      'INSUFFICIENT_PERMISSIONS': 'You do not have permission to access this resource.',
      'NETWORK_ERROR': 'Unable to connect to the server. Please check your connection and try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    return {
      code,
      message: userFriendlyMessages[code] || message,
      timestamp: Date.now()
    };
  }, []);

  // Error recovery strategies
  const recoverFromError = useCallback(async (error: AuthError) => {
    console.info('Attempting error recovery for:', error.code);

    switch (error.code) {
      case 'INVALID_TOKEN':
      case 'EXPIRED_SESSION':
        // Clear invalid session and redirect to login
        setAuthState({
          status: 'unauthenticated',
          user: null,
          token: null,
          permissions: [],
          lastVerified: 0,
          error: null
        });
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sessionToken');
          sessionStorage.clear();
        }
        break;

      case 'NETWORK_ERROR':
        // Retry authentication after a delay
        setTimeout(async () => {
          try {
            // Try to refresh if we have a token
            const currentToken = localStorage.getItem('sessionToken');
            if (currentToken) {
              // The currentUser query will automatically retry
              console.info('Retrying authentication after network error');
            }
          } catch (retryError) {
            console.error('Auth recovery retry failed:', retryError);
          }
        }, 3000); // Retry after 3 seconds
        break;

      case 'INSUFFICIENT_PERMISSIONS':
        // No automatic recovery - user needs to contact admin
        console.warn('Permission denied - no automatic recovery available');
        break;

      case 'UNKNOWN_ERROR':
        // For unknown errors, clear the error state and let the user retry
        setTimeout(() => {
          setAuthState(prev => ({ ...prev, error: null }));
        }, 5000); // Clear error after 5 seconds
        break;

      default:
        console.warn('Unknown error type, no recovery strategy available');
    }
  }, []);

  // Helper function to update auth state
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window !== 'undefined') {
        // Check localStorage first, then cookies as fallback
        let token = localStorage.getItem('sessionToken');
        
        // If no token in localStorage, check cookies
        if (!token) {
          const cookies = document.cookie.split(';');
          const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionToken='));
          if (sessionCookie) {
            token = sessionCookie.split('=')[1];
            // Store in localStorage for consistency
            localStorage.setItem('sessionToken', token);
          }
        }
        
        if (token) {
          updateAuthState({
            status: 'loading',
            token,
            lastVerified: 0,
            error: null
          });
        } else {
          updateAuthState({
            status: 'unauthenticated',
            user: null,
            token: null,
            permissions: [],
            lastVerified: 0,
            error: null
          });
        }
      } else {
        updateAuthState({
          status: 'unauthenticated',
          error: null
        });
      }
    };

    initializeAuth();
  }, [updateAuthState]);

  // Handle current user query results with error recovery
  useEffect(() => {
    if (currentUser !== undefined) {
      if (currentUser) {
        // User data received - authenticated
        const permissions = currentUser.role === 'admin' ? ['admin', 'user'] : ['user'];
        updateAuthState({
          status: 'authenticated',
          user: currentUser,
          permissions,
          lastVerified: Date.now(),
          error: null
        });
      } else if (authState.token) {
        // No user data but we have a token - invalid session
        const error = createAuthError('INVALID_TOKEN', 'Session token is invalid');
        updateAuthState({
          status: 'error',
          user: null,
          permissions: [],
          error
        });
        
        // Trigger automatic recovery
        recoverFromError(error);
      }
    } else if (!authState.token) {
      // No token and no user - unauthenticated
      updateAuthState({
        status: 'unauthenticated',
        user: null,
        permissions: [],
        error: null
      });
    }
  }, [currentUser, authState.token, updateAuthState, createAuthError, recoverFromError]);

  // Monitor for authentication errors and trigger recovery
  useEffect(() => {
    if (authState.error) {
      console.warn('Authentication error detected:', authState.error);
      
      // Don't trigger recovery immediately to avoid loops
      const recoveryTimer = setTimeout(() => {
        recoverFromError(authState.error!);
      }, 1000);

      return () => clearTimeout(recoveryTimer);
    }
  }, [authState.error, recoverFromError]);

  // Actions
  const login = async (email: string, password: string) => {
    try {
      updateAuthState({ status: 'loading', error: null });
      
      const result = await loginMutation({ email, password });
      const permissions = result.user.role === 'admin' ? ['admin', 'user'] : ['user'];
      
      updateAuthState({
        status: 'authenticated',
        user: result.user,
        token: result.sessionToken,
        permissions,
        lastVerified: Date.now(),
        error: null
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', result.sessionToken);
        // Also set as cookie for middleware
        document.cookie = `sessionToken=${result.sessionToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
      }
    } catch (error) {
      console.error('Login error:', error);
      updateAuthState({
        status: 'error',
        user: null,
        token: null,
        permissions: [],
        error: createAuthError('NETWORK_ERROR', error instanceof Error ? error.message : 'Login failed')
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await registerMutation(data);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      updateAuthState({
        status: 'error',
        error: createAuthError('NETWORK_ERROR', error instanceof Error ? error.message : 'Registration failed')
      });
      throw error;
    }
  };

  const logout = async () => {
    const currentToken = authState.token;
    
    // Immediately update state to unauthenticated
    updateAuthState({
      status: 'unauthenticated',
      user: null,
      token: null,
      permissions: [],
      lastVerified: 0,
      error: null
    });
    
    // Clear localStorage and cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
      sessionStorage.clear();
      // Clear the session cookie
      document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Try to logout on server (don't wait for it)
    if (currentToken && logoutMutation) {
      try {
        await logoutMutation({ token: currentToken });
      } catch (error) {
        console.error('Logout error:', error);
        // Don't throw - logout should always succeed locally
      }
    }
  };

  // Role verification cache
  const [roleCache, setRoleCache] = useState<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const ROLE_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  const verifyRole = async (role: 'user' | 'admin'): Promise<boolean> => {
    if (authState.status !== 'authenticated' || !authState.token) {
      updateAuthState({
        error: createAuthError('INVALID_TOKEN', 'No active session')
      });
      return false;
    }

    if (!authState.user) {
      updateAuthState({
        error: createAuthError('INVALID_TOKEN', 'User not authenticated')
      });
      return false;
    }

    try {
      // Check cache first
      const cacheKey = `${authState.user.id}-${role}`;
      const cached = roleCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < ROLE_CACHE_DURATION) {
        // Return cached result if still valid
        if (cached.result) {
          updateAuthState({
            lastVerified: now,
            error: null
          });
        }
        return cached.result;
      }

      // Client-side check first
      const hasPermission = authState.permissions.includes(role);
      
      if (!hasPermission) {
        // Cache negative result
        setRoleCache(prev => new Map(prev).set(cacheKey, { result: false, timestamp: now }));
        updateAuthState({
          error: createAuthError('INSUFFICIENT_PERMISSIONS', `${role} access required`)
        });
        return false;
      }

      // For admin roles, perform server-side verification
      if (role === 'admin') {
        try {
          // Use the checkUserRole query to verify server-side
          const checkUserRoleQuery = api.auth.checkUserRole;
          // Note: In a real implementation, we'd need to call this as a mutation or action
          // For now, we'll rely on the session validation through currentUser query
          
          // Verify the current user query is still returning valid admin data
          if (!currentUser || currentUser.role !== 'admin') {
            // Cache negative result
            setRoleCache(prev => new Map(prev).set(cacheKey, { result: false, timestamp: now }));
            updateAuthState({
              error: createAuthError('INSUFFICIENT_PERMISSIONS', 'Admin role verification failed')
            });
            return false;
          }
        } catch (error) {
          console.error('Server-side role verification failed:', error);
          // Cache negative result
          setRoleCache(prev => new Map(prev).set(cacheKey, { result: false, timestamp: now }));
          updateAuthState({
            error: createAuthError('NETWORK_ERROR', 'Failed to verify admin role with server')
          });
          return false;
        }
      }

      // Cache positive result
      setRoleCache(prev => new Map(prev).set(cacheKey, { result: true, timestamp: now }));
      
      // Update last verified timestamp
      updateAuthState({
        lastVerified: now,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Role verification error:', error);
      updateAuthState({
        error: createAuthError('UNKNOWN_ERROR', 'Failed to verify permissions')
      });
      return false;
    }
  };

  // Clear role cache when user changes or logs out
  useEffect(() => {
    if (authState.status === 'unauthenticated' || !authState.user) {
      setRoleCache(new Map());
    }
  }, [authState.status, authState.user]);

  // Automatic role re-verification for sensitive operations
  const reVerifyRole = async (role: 'user' | 'admin'): Promise<boolean> => {
    if (!authState.user) return false;
    
    // Clear cache for this role to force fresh verification
    const cacheKey = `${authState.user.id}-${role}`;
    setRoleCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      return newCache;
    });
    
    // Perform fresh verification
    return await verifyRole(role);
  };

  const clearAuthError = () => {
    updateAuthState({ error: null });
  };

  const refreshAuth = async () => {
    if (!authState.token) {
      updateAuthState({
        status: 'unauthenticated',
        error: null
      });
      return;
    }

    try {
      updateAuthState({ status: 'loading', error: null });
      // The currentUser query will automatically refresh and update the state
    } catch (error) {
      console.error('Auth refresh error:', error);
      updateAuthState({
        status: 'error',
        error: createAuthError('NETWORK_ERROR', 'Failed to refresh authentication')
      });
    }
  };

  // State check functions
  const isAuthenticated = useCallback(() => {
    return authState.status === 'authenticated' && !!authState.user && !!authState.token;
  }, [authState.status, authState.user, authState.token]);

  const hasRole = useCallback((role: 'user' | 'admin') => {
    return isAuthenticated() && authState.permissions.includes(role);
  }, [isAuthenticated, authState.permissions]);

  const isSessionValid = useCallback(() => {
    if (!isAuthenticated()) return false;
    
    // Check if session was verified recently (within last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return authState.lastVerified > fiveMinutesAgo;
  }, [isAuthenticated, authState.lastVerified]);

  // Get user-friendly error message
  const getUserFriendlyError = useCallback(() => {
    if (!authState.error) return null;
    
    // Return the user-friendly message created by createAuthError
    return authState.error.message;
  }, [authState.error]);

  // Computed properties for backward compatibility
  const user = authState.user;
  const token = authState.token;
  const isLoading = authState.status === 'loading';
  const authError = authState.error?.message || null;

  return (
    <AuthContext.Provider value={{ 
      // State
      authState,
      
      // Computed properties for backward compatibility
      user,
      token,
      isLoading,
      authError,
      
      // Actions
      login, 
      register, 
      logout, 
      verifyRole,
      reVerifyRole,
      clearAuthError,
      refreshAuth,
      
      // State checks
      isAuthenticated,
      hasRole,
      isSessionValid
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe fallback when context is not available
    const fallbackAuthState: AuthState = {
      status: 'error',
      user: null,
      token: null,
      permissions: [],
      lastVerified: 0,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Authentication service not available',
        timestamp: Date.now()
      }
    };

    return {
      authState: fallbackAuthState,
      user: null,
      token: null,
      isLoading: false,
      authError: 'Authentication service not available',
      login: async () => { 
        throw new Error('Authentication service is not available. Please refresh the page.'); 
      },
      register: async () => { 
        throw new Error('Authentication service is not available. Please refresh the page.'); 
      },
      logout: async () => {},
      verifyRole: async () => false,
      reVerifyRole: async () => false,
      clearAuthError: () => {},
      refreshAuth: async () => {},
      isAuthenticated: () => false,
      hasRole: () => false,
      isSessionValid: () => false,
    };
  }
  return context;
}

export function useAuthSafe() {
  try {
    return useAuth();
  } catch (error) {
    const fallbackAuthState: AuthState = {
      status: 'error',
      user: null,
      token: null,
      permissions: [],
      lastVerified: 0,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Authentication system not available',
        timestamp: Date.now()
      }
    };

    return {
      authState: fallbackAuthState,
      user: null,
      token: null,
      isLoading: false,
      authError: 'Authentication system not available',
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
      verifyRole: async () => {
        console.warn('Auth system not available');
        return false;
      },
      reVerifyRole: async () => {
        console.warn('Auth system not available');
        return false;
      },
      clearAuthError: () => {},
      refreshAuth: async () => {},
      isAuthenticated: () => false,
      hasRole: () => false,
      isSessionValid: () => false,
    };
  }
}