
import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart } from "lucide-react";

export function SocialProof() {
  return (
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                A Strong, Supportive Community
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Built on tradition, trust, and mutual support.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="space-y-2">
                <Users className="h-12 w-12 mx-auto text-primary" />
                <p className="text-4xl font-bold text-destructive">150+</p>
                <p className="text-muted-foreground">Families Supported</p>
              </div>
              <div className="space-y-2">
                <Heart className="h-12 w-12 mx-auto text-primary" />
                <p className="text-4xl font-bold text-destructive">20+</p>
                <p className="text-muted-foreground">Years of Service</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <blockquote className="text-lg italic">
                  "Kalkidan e.V. has been a second family to us here in Munich. The support and sense of community is priceless."
                </blockquote>
                <p className="mt-4 font-semibold text-right text-destructive">- Member since 2015</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <blockquote className="text-lg italic">
                  "በከባድ ቀን እ পাশে ቆመው ያጽናኑኛል። ይህ ማህበር ከቤተሰብ በላይ ነው።"
                </blockquote>
                <p className="mt-4 font-semibold text-right text-destructive">- የ10 ዓመት አባል</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
