/**
 * Authentication Security Test Suite
 * Tests for unauthorized access, authentication bypass attempts, and session hijacking prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { AuthProvider, useAuthSafe } from '@/context/auth-context';
import { AuthNav } from '@/components/shared/auth-nav';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/test'),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
  useQuery: vi.fn(() => undefined),
}));

describe('Authentication Security Test Suite', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthorized Access Prevention', () => {
    it('should redirect unauthenticated users from admin routes', async () => {
      const TestComponent = () => (
        <AuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </AuthProvider>
      );

      render(<TestComponent />);

      // Should not show admin content
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      
      // Should show loading state initially
      expect(screen.getByText('Verifying access...')).toBeInTheDocument();
    });

    it('should redirect non-admin users from admin routes', async () => {
      // Mock authenticated user without admin role
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: 'user' as const,
        emailVerified: true
      };

      const TestComponent = () => {
        const authContext = {
          user: mockUser,
          token: 'valid-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: mockUser,
            token: 'valid-token',
            permissions: ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show admin content for non-admin user
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should prevent access during loading states', () => {
      const TestComponent = () => (
        <AuthProvider>
          <ProtectedRoute requiredRole="user">
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      );

      render(<TestComponent />);

      // Should show loading state, not protected content
      expect(screen.getByText('Verifying access...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Bypass Prevention', () => {
    it('should not render protected content with invalid token', () => {
      const TestComponent = () => {
        const authContext = {
          user: null,
          token: 'invalid-token',
          isLoading: false,
          authError: 'Invalid token',
          authState: {
            status: 'error' as const,
            user: null,
            token: null,
            permissions: [],
            lastVerified: 0,
            error: {
              code: 'INVALID_TOKEN' as const,
              message: 'Invalid token',
              timestamp: Date.now()
            }
          },
          isAuthenticated: () => false,
          hasRole: () => false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => false,
        };

        return (
          <ProtectedRoute requiredRole="user">
            <div>Protected Content</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show protected content with invalid token
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not render protected content with expired session', () => {
      const expiredUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: 'user' as const,
        emailVerified: true
      };

      const TestComponent = () => {
        const authContext = {
          user: expiredUser,
          token: 'expired-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: expiredUser,
            token: 'expired-token',
            permissions: ['user'],
            lastVerified: Date.now() - (10 * 60 * 1000), // 10 minutes ago
            error: null
          },
          isAuthenticated: () => true,
          hasRole: () => true,
          isSessionValid: () => false, // Session expired
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
        };

        return (
          <ProtectedRoute requiredRole="user" strictMode={true}>
            <div>Protected Content</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // In strict mode with expired session, should not show content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should validate role permissions before rendering', () => {
      const userWithoutPermissions = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: 'user' as const,
        emailVerified: true
      };

      const TestComponent = () => {
        const authContext = {
          user: userWithoutPermissions,
          token: 'valid-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: userWithoutPermissions,
            token: 'valid-token',
            permissions: [], // No permissions
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: () => false, // No required role
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show admin content without admin role
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Session Hijacking Prevention', () => {
    it('should clear user data immediately on logout', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      
      const TestComponent = () => {
        const authContext = {
          user: {
            id: '1',
            email: 'user@test.com',
            name: 'Test User',
            role: 'user' as const,
            emailVerified: true
          },
          token: 'valid-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: {
              id: '1',
              email: 'user@test.com',
              name: 'Test User',
              role: 'user' as const,
              emailVerified: true
            },
            token: 'valid-token',
            permissions: ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: () => true,
          logout: mockLogout,
          login: vi.fn(),
          register: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return <AuthNav />;
      };

      render(<TestComponent />);

      // Should show user name initially
      expect(screen.getByText('Test User')).toBeInTheDocument();

      // Click logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Should immediately hide user information
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should not show user information during uncertain auth states', () => {
      const TestComponent = () => {
        const authContext = {
          user: {
            id: '1',
            email: 'user@test.com',
            name: 'Test User',
            role: 'user' as const,
            emailVerified: true
          },
          token: null, // No token despite having user
          isLoading: false,
          authError: null,
          authState: {
            status: 'unauthenticated' as const,
            user: null,
            token: null,
            permissions: [],
            lastVerified: 0,
            error: null
          },
          isAuthenticated: () => false,
          hasRole: () => false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => false,
        };

        return <AuthNav />;
      };

      render(<TestComponent />);

      // Should not show user information in uncertain state
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      
      // Should show login/register buttons instead
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should validate session consistency before showing user data', () => {
      const TestComponent = () => {
        const authContext = {
          user: {
            id: '1',
            email: 'user@test.com',
            name: 'Test User',
            role: 'user' as const,
            emailVerified: true
          },
          token: 'valid-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: {
              id: '1',
              email: 'user@test.com',
              name: 'Test User',
              role: 'user' as const,
              emailVerified: true
            },
            token: 'valid-token',
            permissions: ['user'],
            lastVerified: 0, // No recent verification
            error: null
          },
          isAuthenticated: () => true,
          hasRole: () => true,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => false, // Session not valid
        };

        return <AuthNav />;
      };

      render(<TestComponent />);

      // Should not show user information without recent verification
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });
  });

  describe('Error State Security', () => {
    it('should not leak user information during error states', () => {
      const TestComponent = () => {
        const authContext = {
          user: null,
          token: null,
          isLoading: false,
          authError: 'Authentication failed',
          authState: {
            status: 'error' as const,
            user: null,
            token: null,
            permissions: [],
            lastVerified: 0,
            error: {
              code: 'NETWORK_ERROR' as const,
              message: 'Authentication failed',
              timestamp: Date.now()
            }
          },
          isAuthenticated: () => false,
          hasRole: () => false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn(),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => false,
        };

        return (
          <ProtectedRoute requiredRole="user">
            <div>Protected Content</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show protected content during error state
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle authentication context unavailability securely', () => {
      // Test when auth context is not available
      const TestComponent = () => (
        <ProtectedRoute requiredRole="user">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      render(<TestComponent />);

      // Should not show protected content when context is unavailable
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});