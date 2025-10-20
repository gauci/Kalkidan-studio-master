
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { announcements } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default function AnnouncementsPage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Community Announcements
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            All the latest news, events, and updates from Kalkidan e.V.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="flex flex-col border-primary/20 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-destructive font-headline">{announcement.title}</CardTitle>
                <CardDescription>{announcement.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-foreground/90">{announcement.snippet}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="text-accent p-0 h-auto">
                  <Link href={`/announcements/${announcement.id}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
