'use client';

import { useAuthSafe } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AuthNav() {
  const { user, logout, isLoading } = useAuthSafe();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse bg-muted rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {user.name}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/login">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="outline" size="sm">
          Register
        </Button>
      </Link>
    </div>
  );
}