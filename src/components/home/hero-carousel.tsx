
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const carouselImages = [
  {
    src: "https://placehold.co/1920x600.png",
    alt: "Community gathering",
    caption: "የማህበረሰብ ዓመታዊ ስብሰባ",
    dataAiHint: "community gathering",
  },
  {
    src: "https://placehold.co/1920x600.png",
    alt: "Cultural celebration event",
    caption: "የባህል ቀን አከባበር",
    dataAiHint: "cultural celebration",
  },
  {
    src: "https://placehold.co/1920x600.png",
    alt: "Volunteers preparing food",
    caption: "በጎ ፈቃደኞች አገልግሎት ላይ",
    dataAiHint: "community service",
  },
  {
    src: "https://placehold.co/1920x600.png",
    alt: "Children playing at a community event",
    caption: "የልጆች መዝናኛ ፕሮግራም",
    dataAiHint: "children playing",
  },
];

export function HeroCarousel() {
  return (
    <section className="w-full">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  data-ai-hint={image.dataAiHint}
                  priority={index === 0}
                  loading={index > 0 ? "lazy" : "eager"}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-lg md:text-2xl font-semibold font-headline">
                    {image.caption}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>
    </section>
  );
}
