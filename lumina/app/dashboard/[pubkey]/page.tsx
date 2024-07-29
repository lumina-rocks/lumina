'use client';

import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { NostrProvider } from "nostr-react";
import Statistics from '@/components/dashboard/Statistics';

const DashboardPage: React.FC= ({ }) => {

  const params = useParams()
  let pubkey = params.pubkey
  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  if (pubkey.includes("npub")) {
    // convert npub to pubkey
    pubkey = nip19.decode(pubkey.toString()).data.toString()
  }

  const relayUrls = [
    "wss://relay.lumina.rocks",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <Statistics pubkey={pubkey.toString()} />
      </NostrProvider>
    </>
  );
}

export default DashboardPage;