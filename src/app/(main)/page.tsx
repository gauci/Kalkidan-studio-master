
import { AnnouncementsGrid } from "@/components/home/announcements-grid";
import { CtaButtons } from "@/components/home/cta-buttons";
import { FeaturedForms } from "@/components/home/featured-forms";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PinnedAnnouncement } from "@/components/home/pinned-announcement";
import { SocialProof } from "@/components/home/social-proof";
import { StaticLinksGrid } from "@/components/home/static-links-grid";

export default function HomePage() {
  return (
    <>
      <PinnedAnnouncement />
      <HeroCarousel />
      <AnnouncementsGrid />
      <CtaButtons />
      <FeaturedForms />
      <SocialProof />
      <StaticLinksGrid />
    </>
  );
}
