'use client';

import Head from "next/head";
import { NostrProvider } from "nostr-react";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import TagFeed from "@/components/TagFeed";

const relayUrls = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
];

export default function Home() {

  const params = useParams()
  let tag = params.tag
  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  // if (pubkey.includes("npub")) {
  //   // convert npub to pubkey
  //   pubkey = nip19.decode(pubkey.toString()).data.toString()
  // }

  return (
    <>
      <NostrProvider relayUrls={relayUrls}>
        <Head>
          <title>LUMINA.rocks - {tag}</title>
          <meta name="description" content="Yet another nostr web ui" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="py-6 px-6">
          <TagFeed tag={tag.toString()} />
        </div>
      </NostrProvider>
    </>
  );
}
