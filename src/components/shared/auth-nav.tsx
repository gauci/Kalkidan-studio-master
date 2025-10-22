'use client';

import { useAuthSafe } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface AuthNavState {
  showUserInfo: boolean;
  showLogoutButton: boolean;
  showAuthButtons: boolean;
  isVerifying: boolean;
  userDisplayName: string | null;
}

export function AuthNav() {
  const { user, logout, isLoading, authState, isAuthenticated, hasRole } = useAuthSafe();
  const router = useRouter();
  const { toast } = useToast();
  
  const [navState, setNavState] = useState<AuthNavState>({
    showUserInfo: false,
    showLogoutButton: false,
    showAuthButtons: true,
    isVerifying: true,
    userDisplayName: null
  });

  // Comprehensive authentication state validation
  useEffect(() => {
    const validateAndUpdateNavState = () => {
      // SECURE BY DEFAULT: Don't show any user info until fully verified
      
      // Step 1: Check if we're still loading
      if (isLoading || authState.status === 'loading') {
        setNavState({
          showUserInfo: false,
          showLogoutButton: false,
          showAuthButtons: false,
          isVerifying: true,
          userDisplayName: null
        });
        return;
      }

      // Step 2: Handle error states
      if (authState.status === 'error' || authState.error) {
        // Clear any displayed user information on error
        setNavState({
          showUserInfo: false,
          showLogoutButton: false,
          showAuthButtons: true,
          isVerifying: false,
          userDisplayName: null
        });
        return;
      }

      // Step 3: Validate authenticated state
      if (authState.status === 'authenticated') {
        // Triple verification for security
        const hasValidUser = user && user.id && user.name && user.email;
        const hasValidToken = authState.token && authState.token.length > 0;
        const isCurrentlyAuthenticated = isAuthenticated();
        const hasRecentVerification = authState.lastVerified > 0;

        if (hasValidUser && hasValidToken && isCurrentlyAuthenticated && hasRecentVerification) {
          // All checks passed - safe to show user info
          setNavState({
            showUserInfo: true,
            showLogoutButton: true,
            showAuthButtons: false,
            isVerifying: false,
            userDisplayName: user.name
          });
          return;
        } else {
          // Authentication state is inconsistent - hide user info
          console.warn('Authentication state validation failed:', {
            hasValidUser: !!hasValidUser,
            hasValidToken: !!hasValidToken,
            isCurrentlyAuthenticated,
            hasRecentVerification
          });
          
          setNavState({
            showUserInfo: false,
            showLogoutButton: false,
            showAuthButtons: true,
            isVerifying: false,
            userDisplayName: null
          });
          return;
        }
      }

      // Step 4: Handle unauthenticated state
      if (authState.status === 'unauthenticated') {
        setNavState({
          showUserInfo: false,
          showLogoutButton: false,
          showAuthButtons: true,
          isVerifying: false,
          userDisplayName: null
        });
        return;
      }

      // Step 5: Default fallback - secure by default
      setNavState({
        showUserInfo: false,
        showLogoutButton: false,
        showAuthButtons: true,
        isVerifying: false,
        userDisplayName: null
      });
    };

    validateAndUpdateNavState();
  }, [isLoading, authState, user, isAuthenticated]);

  // Automatic cleanup on authentication state changes
  useEffect(() => {
    // If user becomes null or token is cleared, immediately clean up display
    if (!user || !authState.token) {
      setNavState(prev => ({
        ...prev,
        showUserInfo: false,
        showLogoutButton: false,
        userDisplayName: null
      }));
    }
  }, [user, authState.token]);

  // Monitor for authentication errors and clean up immediately
  useEffect(() => {
    if (authState.error) {
      console.warn('Authentication error detected in navigation:', authState.error.message);
      
      // Immediately clear user information
      setNavState({
        showUserInfo: false,
        showLogoutButton: false,
        showAuthButtons: true,
        isVerifying: false,
        userDisplayName: null
      });
    }
  }, [authState.error]);

  const handleLogout = async () => {
    try {
      // IMMEDIATE CLEANUP: Hide user info before logout starts
      setNavState({
        showUserInfo: false,
        showLogoutButton: false,
        showAuthButtons: false,
        isVerifying: true,
        userDisplayName: null
      });

      // Perform logout
      await logout();
      
      // Ensure clean state after logout
      setNavState({
        showUserInfo: false,
        showLogoutButton: false,
        showAuthButtons: true,
        isVerifying: false,
        userDisplayName: null
      });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      
      // SECURITY: Even on error, ensure user info is cleared
      setNavState({
        showUserInfo: false,
        showLogoutButton: false,
        showAuthButtons: true,
        isVerifying: false,
        userDisplayName: null
      });
      
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Consistent navigation behavior - validate before any navigation action
  const handleUserNavigation = () => {
    // Double-check authentication before navigation
    if (!isAuthenticated() || !user) {
      console.warn('Navigation attempted with invalid authentication state');
      router.push('/auth/login');
      return;
    }

    // Navigate based on role
    const destination = hasRole('admin') ? '/admin' : '/dashboard';
    router.push(destination);
  };

  // SECURE RENDERING: Only show elements when state is verified
  
  // Show loading state during verification
  if (navState.isVerifying) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <span className="text-sm text-muted-foreground">Verifying...</span>
        </div>
      </div>
    );
  }

  // Show authenticated user navigation - with validation
  if (navState.showUserInfo && navState.userDisplayName) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleUserNavigation}
        >
          {hasRole('admin') ? (
            <Shield className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="max-w-[120px] truncate">
            {navState.userDisplayName}
          </span>
        </Button>
        
        {/* Only show logout button when fully verified */}
        {navState.showLogoutButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    );
  }

  // Show authentication buttons for unauthenticated users
  if (navState.showAuthButtons) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button variant="outline" size="sm">
            <span className="hidden sm:inline">Register</span>
            <span className="sm:hidden">Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  // Fallback: show nothing if state is uncertain
  return null;
}