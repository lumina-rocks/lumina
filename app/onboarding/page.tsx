"use client";

import { CreateSecretKeyForm } from "@/components/onboarding/createSecretKeyForm";
import { useEffect } from "react";

export default function OnboardingHome() {
  useEffect(() => {
    document.title = `Onboarding | LUMINA`;
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="space-y-6 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to LUMINA</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Join the decentralized social network powered by Nostr. No central servers, just communication that you control.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Step 1: Create Your Keys</h2>
          <p className="text-muted-foreground">
            In Nostr, your identity is based on a pair of cryptographic keys. The secret key (nsec) 
            is like your password - never share it with anyone. The public key (npub) is your public 
            identity that others use to find you.
          </p>
        </div>
        <CreateSecretKeyForm />
      </div>
    </div>
  );
}
