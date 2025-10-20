
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About Kalkidan e.V.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            A pillar of the Ethiopian community in Munich for over two decades.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-3xl font-bold">Our History</h2>
            <p className="mt-4 text-lg text-foreground/80">
              Founded in the late 1990s by a small group of Ethiopian families,
              Kalkidan e.V. was established to provide mutual support and preserve
              our rich cultural heritage here in Munich. The word "Kalkidan" means
              "covenant" or "promise," reflecting our commitment to stand by one
              another in times of joy and sorrow. What started as an informal
              gathering has grown into a formally registered association (e.V.)
              that serves over 150 families, providing financial, emotional, and
              social support in accordance with the traditions of an Ethiopian Edir.
            </p>
          </section>

          <section>
            <Image
              src="https://placehold.co/800x400.png"
              alt="A group photo of Kalkidan e.V. members"
              width={800}
              height={400}
              className="rounded-lg shadow-lg mx-auto"
              data-ai-hint="community group photo"
            />
          </section>

          <section>
            <h2 className="text-3xl font-bold">From Our Members</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <Card className="bg-secondary border-primary/10">
                <CardContent className="p-6">
                  <blockquote className="text-base italic">
                    "When my father passed away, the support from Kalkidan was
                    immediate and overwhelming. They handled everything with such
                    grace and allowed my family to grieve without the added stress.
                    I am forever grateful."
                  </blockquote>
                  <p className="mt-4 font-semibold text-right text-primary">
                    - Hanna T.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-secondary border-primary/10">
                <CardContent className="p-6">
                  <blockquote className="text-base italic">
                    "This Edir is not just about difficult times. It's about
                    celebrating together, raising our children in our culture, and
                    having a network that feels like home. It is a vital part of
                    our life in Germany."
                  </blockquote>
                  <p className="mt-4 font-semibold text-right text-primary">
                    - Solomon B.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
