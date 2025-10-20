
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, HandHelping } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/context/language-context";

export function Header() {
  const { translations } = useLanguage();
  
  const navLinks = [
    { href: "/", label: translations.header.home },
    { href: "/announcements", label: translations.header.announcements },
    { href: "/downloads", label: translations.header.downloads },
    { href: "/profile", label: translations.header.profile },
    { href: "/contact", label: translations.header.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary text-primary-foreground shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <HandHelping className="h-6 w-6 text-accent" />
          <span className="font-headline text-xl font-bold text-primary-foreground">
            Kalkidan e.V.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/login">{translations.header.login}</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary text-primary-foreground">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <HandHelping className="h-6 w-6 text-accent" />
                  <span className="font-headline text-xl font-bold text-primary-foreground">
                    Kalkidan e.V.
                  </span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                   <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                     <Link href="/login">{translations.header.login}</Link>
                   </Button>
                   <div className="self-center">
                    <LanguageSwitcher />
                   </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
