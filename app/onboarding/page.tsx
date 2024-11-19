"use client";

import { CreateSecretKeyForm } from "@/components/onboarding/createSecretKeyForm";
import { Button } from "@/components/ui/button";
import { NostrProvider } from "nostr-react";


export default function OnboardingHome() {

  const relayUrls = [
    "wss://relay.nostr.band",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <div className="flex flex-col items-center py-6 px-6">
          <h1>Step 1: Create your secret key</h1>
          <CreateSecretKeyForm />
        </div>
      </NostrProvider>
    </>
  );
}
