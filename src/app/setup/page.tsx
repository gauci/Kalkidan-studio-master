'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EthiopianPattern } from '@/components/icons/ethiopian-pattern';
import { Shield, User, Mail, Lock } from 'lucide-react';

export default function SetupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only use Convex hooks on client side
  let createFirstAdmin = null;
  try {
    createFirstAdmin = isClient ? useMutation(api.auth.createFirstAdmin) : null;
  } catch (error) {
    // Convex not available
    createFirstAdmin = null;
  }
  
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFirstAdmin) {
      toast({
        title: "Setup Error",
        description: "Setup service is not available. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await createFirstAdmin({
        email: email.trim(),
        name: name.trim(),
        password,
      });

      toast({
        title: "Admin Account Created!",
        description: "Your admin account has been created successfully. You can now log in.",
      });

      router.push('/auth/login');
    } catch (error) {
      toast({
        title: "Setup Error",
        description: error instanceof Error ? error.message : "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if not on client side yet
  if (!isClient) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 z-0">
          <EthiopianPattern className="opacity-20" />
        </div>
        <div className="relative z-10 w-full max-w-md p-4">
          <Card className="border-primary shadow-2xl">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading setup...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 z-0">
        <EthiopianPattern className="opacity-20" />
      </div>
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="border-primary shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Initial Setup</CardTitle>
            <CardDescription>
              Create the first admin account for your CMS system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must contain uppercase, lowercase, and number (min 8 characters)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                This will create the first admin user for your CMS system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}