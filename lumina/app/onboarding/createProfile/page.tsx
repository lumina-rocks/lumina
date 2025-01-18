"use client";

import { UpdateProfileForm } from "@/components/UpdateProfileForm";
import { NostrProvider } from "nostr-react";


export default function OnboardingCreateProfile() {

  const relayUrls = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <div className="flex flex-col items-center py-6 px-6">
          <h1>Step 2: Create Profile</h1>
          <UpdateProfileForm />
        </div>
      </NostrProvider>
    </>
  );
}
