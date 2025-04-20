"use client";

import { CreateProfileForm } from "@/components/CreateProfileForm";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OnboardingCreateProfile() {
  useEffect(() => {
    document.title = `Create Profile | LUMINA`;
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="space-y-6 text-center mb-8">
        <div className="flex items-center justify-center gap-2">
          <Link 
            href="/onboarding" 
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm absolute left-6 md:left-10"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create Your Profile</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Set up your public profile information. This will be visible to everyone 
          on the Nostr network and help others find and connect with you.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Step 2: Personalize Your Profile</h2>
          <p className="text-muted-foreground">
            Your profile information will be published to the Nostr network as a kind 0 event. 
            You can update this information anytime after creating your profile.
          </p>
        </div>
        <CreateProfileForm />
      </div>
    </div>
  );
}
