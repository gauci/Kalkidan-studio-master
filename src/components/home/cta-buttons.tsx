
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Download, Megaphone } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function CtaButtons() {
  const { translations } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-pattern">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="h-16 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/join">
              <UserPlus className="mr-2 h-5 w-5" /> {translations.cta.join}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-16 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/downloads">
              <Download className="mr-2 h-5 w-5" /> {translations.cta.forms}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-16 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/announcements">
              <Megaphone className="mr-2 h-5 w-5" /> {translations.cta.announcements}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
