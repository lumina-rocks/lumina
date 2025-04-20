'use client';

import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { UpdateProfileForm } from "@/components/UpdateProfileForm";
import { useEffect } from 'react';

export default function ProfileSettingsPage() {
    useEffect(() => {
        document.title = `Settings | LUMINA`;
    }, []);
  
  let pubkey = null;
  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem('pubkey');
  }
  // check if pubkey is not null and contains "npub"
  // if so, then we need to convert it to a pubkey
  if (pubkey && pubkey.includes("npub")) {
    // convert npub to pubkey
    pubkey = nip19.decode(pubkey.toString()).data.toString()
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Update your profile information that will be visible to others on the Nostr network
          </p>
        </div>
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <UpdateProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}