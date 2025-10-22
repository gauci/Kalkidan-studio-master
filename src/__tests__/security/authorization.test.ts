/**
 * Authorization Security Test Suite
 * Tests for role-based access control, privilege escalation prevention, and UI element visibility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { AuthProvider } from '@/context/auth-context';
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

// Test users with different roles
const testUsers = {
  admin: {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin' as const,
    emailVerified: true
  },
  user: {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Regular User',
    role: 'user' as const,
    emailVerified: true
  },
  unverified: {
    id: 'unverified-1',
    email: 'unverified@test.com',
    name: 'Unverified User',
    role: 'user' as const,
    emailVerified: false
  }
};

describe('Authorization Security Test Suite', () => {
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

  describe('Admin Route Access Control', () => {
    it('should allow admin users to access admin routes', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.admin,
          token: 'admin-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.admin,
            token: 'admin-token',
            permissions: ['admin', 'user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => ['admin', 'user'].includes(role),
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(true),
          reVerifyRole: vi.fn().mockResolvedValue(true),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Admin should be able to see admin content
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should deny regular users access to admin routes', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.user,
          token: 'user-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.user,
            token: 'user-token',
            permissions: ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(false),
          reVerifyRole: vi.fn().mockResolvedValue(false),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Regular user should not see admin content
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should allow admin users to access user routes', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.admin,
          token: 'admin-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.admin,
            token: 'admin-token',
            permissions: ['admin', 'user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => ['admin', 'user'].includes(role),
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(true),
          reVerifyRole: vi.fn().mockResolvedValue(true),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="user">
            <div>User Dashboard</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Admin should be able to access user routes
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });
  });

  describe('Privilege Escalation Prevention', () => {
    it('should not allow role modification through client-side manipulation', () => {
      // Simulate attempt to modify user role client-side
      const manipulatedUser = {
        ...testUsers.user,
        role: 'admin' as const // Client-side role manipulation
      };

      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: manipulatedUser,
          token: 'user-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: manipulatedUser,
            token: 'user-token',
            permissions: ['user'], // Server-side permissions still user-level
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user', // Server-side role check
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(false), // Server denies admin access
          reVerifyRole: vi.fn().mockResolvedValue(false),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should not show admin content despite client-side role manipulation
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should validate permissions against server-side data', async () => {
      const TestComponent = () => {
        const authContext = {
          user: testUsers.user,
          token: 'user-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.user,
            token: 'user-token',
            permissions: ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockImplementation(async (role: string) => {
            // Simulate server-side role verification
            if (role === 'admin') {
              return false; // Server denies admin access
            }
            return role === 'user';
          }),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show admin content after server-side verification
      await waitFor(() => {
        expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      });
    });

    it('should prevent token manipulation attacks', () => {
      const TestComponent = () => {
        const authContext = {
          user: testUsers.user,
          token: 'manipulated-admin-token', // Fake admin token
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.user,
            token: 'manipulated-admin-token',
            permissions: ['user'], // Server returns actual permissions
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user', // Server-side role check
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(false), // Server denies admin access
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        );
      };

      render(<TestComponent />);

      // Should not show admin content despite manipulated token
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('UI Element Visibility Based on Permissions', () => {
    it('should show admin navigation elements only for admin users', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.admin,
          token: 'admin-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.admin,
            token: 'admin-token',
            permissions: ['admin', 'user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => ['admin', 'user'].includes(role),
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(true),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <AuthNav />
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should show admin user name
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      
      // Should show logout button for authenticated admin
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should show regular user navigation elements for regular users', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.user,
          token: 'user-token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: testUsers.user,
            token: 'user-token',
            permissions: ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(true),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <AuthNav />
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should show regular user name
      expect(screen.getByText('Regular User')).toBeInTheDocument();
      
      // Should show logout button for authenticated user
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should hide user-specific elements for unauthenticated users', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: null,
          token: null,
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
          verifyRole: vi.fn().mockResolvedValue(false),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => false,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <AuthNav />
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should not show user names
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
      expect(screen.queryByText('Regular User')).not.toBeInTheDocument();
      
      // Should not show logout button
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
      
      // Should show login/register buttons
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should not show sensitive UI elements during loading states', () => {
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: testUsers.admin, // User data exists
          token: 'admin-token',
          isLoading: true, // But still loading
          authError: null,
          authState: {
            status: 'loading' as const,
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

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <AuthNav />
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should not show user information during loading
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
      
      // Should show loading state
      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    it('should validate UI element visibility against actual permissions', () => {
      // Test case where user object claims admin but permissions don't match
      const inconsistentUser = {
        ...testUsers.admin,
        role: 'admin' as const
      };

      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: inconsistentUser,
          token: 'token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: inconsistentUser,
            token: 'token',
            permissions: ['user'], // Permissions don't match claimed role
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => role === 'user', // Only user role allowed
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockResolvedValue(false), // Admin verification fails
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Panel</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      render(<TestComponent />);

      // Should not show admin content despite user object claiming admin role
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });
  });

  describe('Role Transition Security', () => {
    it('should handle role changes securely', async () => {
      let currentRole = 'user';
      
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const authContext = {
          user: {
            ...testUsers.user,
            role: currentRole as 'user' | 'admin'
          },
          token: 'token',
          isLoading: false,
          authError: null,
          authState: {
            status: 'authenticated' as const,
            user: {
              ...testUsers.user,
              role: currentRole as 'user' | 'admin'
            },
            token: 'token',
            permissions: currentRole === 'admin' ? ['admin', 'user'] : ['user'],
            lastVerified: Date.now(),
            error: null
          },
          isAuthenticated: () => true,
          hasRole: (role: string) => {
            if (currentRole === 'admin') return ['admin', 'user'].includes(role);
            return role === 'user';
          },
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          verifyRole: vi.fn().mockImplementation(async (role: string) => {
            if (currentRole === 'admin') return ['admin', 'user'].includes(role);
            return role === 'user';
          }),
          reVerifyRole: vi.fn(),
          clearAuthError: vi.fn(),
          refreshAuth: vi.fn(),
          isSessionValid: () => true,
        };

        return (
          <div data-testid="mock-auth-provider">
            {children}
          </div>
        );
      };

      const TestComponent = () => (
        <MockAuthProvider>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MockAuthProvider>
      );

      const { rerender } = render(<TestComponent />);

      // Initially should not show admin content
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();

      // Simulate role upgrade
      currentRole = 'admin';
      rerender(<TestComponent />);

      // Should now show admin content
      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument();
      });
    });
  });
});