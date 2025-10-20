
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/shared/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Get In Touch
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            We're here to help and answer any question you might have.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold">Contact Information</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Our administration team is available to assist you.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-foreground/80">123 Community Lane, 80331 Munich, Germany</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-foreground/80">+49 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-foreground/80">contact@kalkidan-ev.de</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 lg:col-span-2">
            <Card className="bg-background border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
