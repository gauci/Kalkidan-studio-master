
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/shared/contact-form";
import { Download, Edit3, Send } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: <Download className="h-8 w-8 text-primary" />,
    title: "Download the Form",
    description: "Start by downloading the official membership application form from our downloads page.",
  },
  {
    icon: <Edit3 className="h-8 w-8 text-primary" />,
    title: "Fill It Out",
    description: "Complete the application form with your personal details and information about your family members.",
  },
  {
    icon: <Send className="h-8 w-8 text-primary" />,
    title: "Submit and Wait for Approval",
    description: "Submit the filled form to our administration. Your application will be reviewed at the next monthly meeting.",
  },
];

export default function JoinPage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Join Our Community
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Become a part of the Kalkidan e.V. family and embrace our tradition of mutual support.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-center">Three Simple Steps</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={index} className="text-center bg-secondary border-primary/10">
                <CardHeader className="items-center">
                  {step.icon}
                  <CardTitle className="mt-2">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/downloads">
                <Download className="mr-2 h-5 w-5" /> Get the Membership Form
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Have Questions?</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Feel free to reach out to us.
            </p>
          </div>
          <Card className="mt-8 max-w-2xl mx-auto bg-background border-primary/20">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
