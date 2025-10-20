
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, X } from "lucide-react";
import Link from "next/link";
import { announcements } from "@/lib/data";

export function PinnedAnnouncement() {
  const [isVisible, setIsVisible] = useState(true);
  const latestAnnouncement = announcements[0];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-destructive text-destructive-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center">
            <Megaphone className="h-6 w-6 mr-3" />
            <p className="font-medium">
              <span className="font-bold mr-2">Latest:</span>
              <Link href={`/announcements/${latestAnnouncement.id}`} className="hover:underline">
                {latestAnnouncement.title}
              </Link>
            </p>
          </div>
          <div className="flex items-center">
            <Button
              variant="link"
              className="text-destructive-foreground hover:text-destructive-foreground/80"
              asChild
            >
              <Link href={`/announcements/${latestAnnouncement.id}`}>Mark as Read</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-7 w-7 hover:bg-destructive/80"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
