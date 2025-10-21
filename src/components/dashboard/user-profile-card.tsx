'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { User as UserIcon, Mail, Phone, MapPin, Shield } from 'lucide-react';

export function UserProfileCard() {
  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Auth context not available
    authContext = null;
  }
  
  const { user } = authContext || { user: null };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role === 'admin' ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </>
            ) : (
              'User'
            )}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{user.name}</span>
        </div>

        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}

        {user.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.address}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Email verified: {user.emailVerified ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}