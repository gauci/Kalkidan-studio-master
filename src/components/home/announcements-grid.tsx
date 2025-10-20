
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { announcements } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export function AnnouncementsGrid() {
  const recentAnnouncements = announcements.slice(0, 2);

  return (
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            Recent Announcements
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Stay updated with the latest news from our community.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {recentAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="flex flex-col border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="font-headline text-destructive">{announcement.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{announcement.date}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{announcement.snippet}</p>
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
        <div className="text-center mt-12">
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/announcements">View All Announcements</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
