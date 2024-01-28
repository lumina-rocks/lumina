'use client';

import Head from "next/head";
import { NostrProvider } from "nostr-react";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";

const relayUrls = [
  "wss://relay.damus.io",
];

export default function Home() {

  const params = useParams()
  let pubkey = params.pubkey
  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  if (pubkey.includes("npub")) {
    // convert npub to pubkey
    pubkey = nip19.decode(pubkey.toString()).data.toString()
  }

  return (
    <>
      <NostrProvider relayUrls={relayUrls}>
        <Head>
          <title>LUMINA.rocks - {pubkey}</title>
          <meta name="description" content="Yet another nostr web ui" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="py-6 px-6">
          <div className="pb-6">
            <ProfileInfoCard pubkey={pubkey.toString()} />
          </div>
          <ProfileFeed pubkey={pubkey.toString()} />
        </div>
      </NostrProvider>
    </>
  );
}
