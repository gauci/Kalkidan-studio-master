
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, HandHelping, User, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/context/language-context";
import { useAuthSafe } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { translations } = useLanguage();
  const { user, logout } = useAuthSafe();
  const router = useRouter();
  const { toast } = useToast();
  
  const navLinks = [
    { href: "/", label: translations.header.home },
    { href: "/announcements", label: translations.header.announcements },
    { href: "/downloads", label: translations.header.downloads },
    { href: "/profile", label: translations.header.profile },
    { href: "/contact", label: translations.header.contact },
  ];

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
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
          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  {user.name}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/auth/register">Register</Link>
              </Button>
              <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/auth/login">{translations.header.login}</Link>
              </Button>
            </div>
          )}
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
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/dashboard">
                          <User className="h-4 w-4 mr-2" />
                          {user.name}
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="text-primary-foreground border-primary-foreground"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="text-primary-foreground border-primary-foreground">
                        <Link href="/auth/register">Register</Link>
                      </Button>
                      <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/auth/login">{translations.header.login}</Link>
                      </Button>
                    </div>
                  )}
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
