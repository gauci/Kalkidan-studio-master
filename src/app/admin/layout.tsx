
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  MessageSquare,
  LogOut,
  HandHelping,
} from "lucide-react";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { useAuthSafe } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AuthLoadingFallback, AuthErrorFallback } from "@/components/shared/auth-fallback";
import { AuthErrorBoundary } from "@/components/shared/auth-error-boundary";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, requiredRole: "admin" as const },
  { href: "/admin/users", label: "Users", icon: Users, requiredRole: "admin" as const },
  { href: "/admin/content", label: "Content", icon: FileText, requiredRole: "admin" as const },
  { href: "/admin/members", label: "Members", icon: Users, requiredRole: "admin" as const },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, requiredRole: "admin" as const },
  { href: "/admin/files", label: "Files", icon: FileText, requiredRole: "admin" as const },
];

// Function to filter navigation items based on user role
const getAuthorizedNavItems = (userRole: string | undefined) => {
  if (!userRole) return [];
  
  return adminNavItems.filter(item => {
    if (item.requiredRole === "admin") {
      return userRole === "admin";
    }
    return true; // For items that don't require specific roles
  });
};

interface AdminLayoutState {
  authVerified: boolean;
  roleVerified: boolean;
  isLoading: boolean;
  shouldRedirect: boolean;
  redirectPath: string;
  error: string | null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, token, logout, verifyRole, isLoading, authError } = useAuthSafe();
  const router = useRouter();
  const { toast } = useToast();
  
  const [adminState, setAdminState] = useState<AdminLayoutState>({
    authVerified: false,
    roleVerified: false,
    isLoading: true,
    shouldRedirect: false,
    redirectPath: '/auth/login',
    error: null
  });

  // Session validation and security monitoring
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    const validateSession = async () => {
      if (!token || !user) return;

      try {
        // Verify session is still valid by checking user data
        const isValid = await verifyRole('admin');
        
        if (!isValid) {
          // Session expired or invalid - log security event
          console.warn('Admin session validation failed:', {
            userId: user.id,
            timestamp: new Date().toISOString(),
            route: pathname,
            reason: 'Session validation failed'
          });

          // Clear session and redirect
          await logout();
          toast({
            title: "Session Expired",
            description: "Your admin session has expired. Please log in again.",
            variant: "destructive",
          });
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        // On validation error, assume session is compromised
        await logout();
        router.push('/auth/login');
      }
    };

    // Validate session every 5 minutes for admin routes
    if (user && token && adminState.roleVerified) {
      sessionCheckInterval = setInterval(validateSession, 5 * 60 * 1000);
    }

    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [user, token, adminState.roleVerified, verifyRole, logout, router, toast, pathname]);

  // Verify authentication and admin role on mount and when auth state changes
  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Don't verify if already loading or if there's no user/token
      if (isLoading || !user || !token) {
        setAdminState(prev => ({
          ...prev,
          isLoading: isLoading,
          authVerified: !!user && !!token,
          roleVerified: false,
          error: authError
        }));
        return;
      }

      // Skip verification if already verified for this user session
      if (adminState.authVerified && adminState.roleVerified && user.id) {
        return;
      }

      try {
        // Log admin access attempt (only on initial verification)
        console.info('Admin access attempt:', {
          userId: user.id,
          userRole: user.role,
          timestamp: new Date().toISOString(),
          route: pathname,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
        });

        // Verify admin role server-side
        const hasAdminRole = await verifyRole('admin');
        
        setAdminState({
          authVerified: true,
          roleVerified: hasAdminRole,
          isLoading: false,
          shouldRedirect: !hasAdminRole,
          redirectPath: hasAdminRole ? '' : '/dashboard',
          error: hasAdminRole ? null : 'Admin access required'
        });

        if (hasAdminRole) {
          // Log successful admin access (only on initial verification)
          console.info('Admin access granted:', {
            userId: user.id,
            timestamp: new Date().toISOString(),
            route: pathname
          });
        } else {
          // Log unauthorized admin access attempt
          console.warn('Unauthorized admin access attempt:', {
            userId: user.id,
            userRole: user.role,
            timestamp: new Date().toISOString(),
            route: pathname,
            reason: 'Insufficient privileges'
          });

          toast({
            title: "Access Denied",
            description: "Admin privileges required to access this area.",
            variant: "destructive",
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Admin role verification failed:', error);
        
        // Log security event for failed verification
        console.warn('Admin access verification failed:', {
          userId: user?.id || 'unknown',
          timestamp: new Date().toISOString(),
          route: pathname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        setAdminState({
          authVerified: false,
          roleVerified: false,
          isLoading: false,
          shouldRedirect: true,
          redirectPath: '/auth/login',
          error: 'Authentication verification failed'
        });
        router.push('/auth/login');
      }
    };

    verifyAdminAccess();
  }, [user, token, isLoading, verifyRole, authError, router, toast]);

  const handleLogout = async (reason?: string) => {
    try {
      // Log logout event
      console.info('Admin logout:', {
        userId: user?.id || 'unknown',
        timestamp: new Date().toISOString(),
        route: pathname,
        reason: reason || 'User initiated'
      });

      if (logout) {
        await logout();
      }
      
      const message = reason === 'session_expired' 
        ? "Your session has expired. Please log in again."
        : "You have been successfully logged out.";
        
      toast({
        title: reason === 'session_expired' ? "Session Expired" : "Logged Out",
        description: message,
        variant: reason === 'session_expired' ? "destructive" : "default",
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // SECURE RENDERING: Never show admin interface until fully verified
  
  // Show loading state while verifying authentication and role
  if (adminState.isLoading || isLoading) {
    return (
      <AuthLoadingFallback message="Verifying admin access..." />
    );
  }

  // Show error state if authentication failed
  if (adminState.error || authError) {
    return (
      <AuthErrorFallback 
        message={adminState.error || authError || "Authentication error"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Redirect if should redirect (don't show any admin content)
  if (adminState.shouldRedirect) {
    return null;
  }

  // Don't show admin interface if not authenticated
  if (!adminState.authVerified || !user || !token) {
    return null;
  }

  // Don't show admin interface if role not verified
  if (!adminState.roleVerified || user.role !== 'admin') {
    return null;
  }

  // All security checks passed - safe to render admin interface
  return (
    <AuthErrorBoundary>
      <ProtectedRoute requiredRole="admin" strictMode={true}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <HandHelping className="w-6 h-6 text-sidebar-primary" />
                <span className="text-lg font-headline font-semibold text-sidebar-foreground">
                  Admin Panel
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {/* Only show navigation items after role verification */}
                {adminState.roleVerified && user && 
                  getAuthorizedNavItems(user.role).map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          tooltip={item.label}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))
                }
                
                {/* Show loading state for navigation if role not yet verified */}
                {!adminState.roleVerified && adminState.isLoading && (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 p-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span className="text-sm">Loading navigation...</span>
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              {/* Only show logout button after full verification */}
              {adminState.authVerified && adminState.roleVerified && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={() => handleLogout('user_initiated')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              )}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-semibold font-headline">
                {adminState.roleVerified && user 
                  ? getAuthorizedNavItems(user.role).find(item => item.href === pathname)?.label || "Dashboard"
                  : "Admin Panel"
                }
              </h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    </AuthErrorBoundary>
  );
}
