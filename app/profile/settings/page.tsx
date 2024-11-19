'use client';

import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { NostrProvider } from "nostr-react";
import { UpdateProfileForm } from "@/components/UpdateProfileForm";

export default function ProfileSettingsPage() {

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

  const relayUrls = [
    "wss://relay.lumina.rocks",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <div className="flex flex-col items-center py-6 px-6">
          <UpdateProfileForm />
        </div>
      </NostrProvider>
    </>
  );
}
