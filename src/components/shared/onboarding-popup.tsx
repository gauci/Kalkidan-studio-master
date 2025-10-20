'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function OnboardingPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenOnboarding');
      if (!seen) {
        setHasSeenOnboarding(false);
        setIsOpen(true);
      }
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  if (hasSeenOnboarding) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Welcome to Kalkidan Community Hub!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your community platform is now ready with enhanced features:
          </p>
          <ul className="text-sm space-y-2">
            <li>• User authentication and file management</li>
            <li>• Admin content management system</li>
            <li>• News and announcements</li>
            <li>• Secure file sharing</li>
          </ul>
          <Button onClick={handleClose} className="w-full">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}