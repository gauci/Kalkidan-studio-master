
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to an API endpoint
    // For now, we'll just simulate a successful submission
    setIsSubmitted(true);
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your valuable feedback!",
    });
    setTimeout(() => {
        onOpenChange(false);
        setIsSubmitted(false);
    }, 2000)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-primary">
        <DialogHeader>
          <DialogTitle className="font-headline text-destructive">
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve our community hub. Your feedback is valuable.
          </DialogDescription>
        </DialogHeader>
        {isSubmitted ? (
          <div className="py-8 text-center">
            <h3 className="text-xl font-bold text-primary">Thank You!</h3>
            <p>Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Was the website easy to use?</Label>
                <RadioGroup defaultValue="yes">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="r1" />
                    <Label htmlFor="r1">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="r2" />
                    <Label htmlFor="r2">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Any other comments?</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us more..."
                  className="bg-background"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
