
"use client";

import { useState } from "react";
import Link from "next/link";
import { HandHelping } from "lucide-react";
import { FeedbackModal } from "../shared/feedback-modal";

export function Footer() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-primary text-primary-foreground">
        <div className="container py-12 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <HandHelping className="h-8 w-8 text-accent" />
                <span className="font-headline text-2xl font-bold text-primary-foreground">
                  Kalkidan e.V.
                </span>
              </Link>
              <p className="text-sm text-primary-foreground/80">
                An Ethiopian Edir in Munich, Germany. <br />
                Connecting and supporting our community.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-accent">
                    Quick Links
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/announcements" className="text-base text-primary-foreground/80 hover:text-accent">
                        Announcements
                      </Link>
                    </li>
                    <li>
                      <Link href="/downloads" className="text-base text-primary-foreground/80 hover:text-accent">
                        Downloads
                      </Link>
                    </li>
                    <li>
                      <Link href="/join" className="text-base text-primary-foreground/80 hover:text-accent">
                        Join Us
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-accent">
                    About
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/about" className="text-base text-primary-foreground/80 hover:text-accent">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/bylaws" className="text-base text-primary-foreground/80 hover:text-accent">
                        Bylaws
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-base text-primary-foreground/80 hover:text-accent">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-1 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-accent">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <button
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="text-base text-primary-foreground/80 hover:text-accent"
                      >
                        Give Feedback
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-primary-foreground/20 pt-8">
            <p className="text-base text-primary-foreground/60 xl:text-center">
              &copy; {new Date().getFullYear()} Kalkidan e.V. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <FeedbackModal open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen} />
    </>
  );
}
