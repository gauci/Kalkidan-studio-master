
import { notFound } from "next/navigation";
import { announcements, type Announcement } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function AnnouncementDetailView({ announcement }: { announcement: Announcement }) {
  "use client";

  function CondolenceForm({ announcementId }: { announcementId: string }) {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const message = formData.get("message");
      
      // In a real app, you would post this to your API
      console.log({ announcementId, message });

      toast({
        title: "Message Submitted",
        description: "Your condolence message has been submitted for moderation. Thank you.",
      });
      (e.target as HTMLFormElement).reset();
    };

    return (
      <Card className="mt-8 bg-secondary border-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Leave a Message of Condolence</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
              <Label htmlFor="message" className="sr-only">Your message</Label>
              <Textarea
                  id="message"
                  name="message"
                  placeholder="Type your message here..."
                  rows={4}
                  required
                  className="bg-background"
              />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Submit Message</Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  const approvedCondolences = announcement.condolences?.filter(c => c.approved) || [];

  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <article>
          <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {announcement.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Posted on {announcement.date}
            </p>
          </header>
          <div className="prose prose-lg max-w-none text-foreground/90">
            <p>{announcement.content}</p>
          </div>
        </article>

        {announcement.isCondolence && (
          <section className="mt-12">
            {approvedCondolences.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 font-headline">Messages from the Community</h2>
                    <div className="space-y-4">
                        {approvedCondolences.map((condolence, index) => (
                            <Card key={index} className="bg-secondary border-primary/10">
                                <CardContent className="p-4">
                                    <p className="italic">"{condolence.message}"</p>
                                    <p className="text-right text-sm font-semibold mt-2 text-muted-foreground">- {condolence.user}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            <CondolenceForm announcementId={announcement.id} />
          </section>
        )}
      </div>
    </div>
  );
}


export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const announcement = announcements.find((a) => a.id === params.id);

  if (!announcement) {
    notFound();
  }

  return <AnnouncementDetailView announcement={announcement} />;
}
