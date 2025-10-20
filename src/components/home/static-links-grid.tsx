
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Info, Users, BookOpen, Mail } from "lucide-react";

const staticPages = [
  {
    href: "/about",
    title: "About Us",
    icon: <Info className="h-12 w-12 text-accent" />,
  },
  {
    href: "/join",
    title: "How to Join",
    icon: <Users className="h-12 w-12 text-accent" />,
  },
  {
    href: "/bylaws",
    title: "Bylaws & Rules",
    icon: <BookOpen className="h-12 w-12 text-accent" />,
  },
  {
    href: "/contact",
    title: "Contact Us",
    icon: <Mail className="h-12 w-12 text-accent" />,
  },
];

export function StaticLinksGrid() {
  return (
    <section className="py-12 md:py-20 bg-pattern">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {staticPages.map((page) => (
            <Link key={page.href} href={page.href} className="group">
              <Card className="h-full text-center border-primary/20 hover:border-accent hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="items-center">
                  {page.icon}
                  <CardTitle className="mt-4 font-headline text-destructive group-hover:text-accent transition-colors">
                    {page.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
