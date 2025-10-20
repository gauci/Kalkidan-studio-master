
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HandHelping, Megaphone, Download, UserCircle } from "lucide-react";

const OnboardingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedKalkidanHub");
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("hasVisitedKalkidanHub", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="bg-background border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-destructive">
            <HandHelping className="h-6 w-6" /> Welcome to Kalkidan e.V. Community Hub!
          </DialogTitle>
          <DialogDescription className="pt-2">
            Here is a quick guide to get you started.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <UserCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Login or Register</h4>
              <p className="text-sm text-muted-foreground">Access member-only features by logging in or registering a new account.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Megaphone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Find Announcements</h4>
              <p className="text-sm text-muted-foreground">Stay up-to-date with the latest community news and events.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Download className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Download Forms</h4>
              <p className="text-sm text-muted-foreground">Easily access important documents like membership applications.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDismiss} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { OnboardingPopup };
