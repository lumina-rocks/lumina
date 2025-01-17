'use client';

import Head from "next/head";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import TagFeed from "@/components/TagFeed";
import { NostrProvider } from "nostr-react";
import FollowerFeed from "@/components/FollowerFeed";
import ProfileQuickViewFeed from "@/components/ProfileQuickViewFeed";
import FollowerQuickViewFeed from "@/components/FollowerQuickViewFeed";
import SearchProfilesBox from "@/components/searchComponents/SearchProfilesBox";
import SearchNotesBox from "@/components/searchComponents/SearchNotesBox";

export default function SearchPage() {

  let pubkey = null;
  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem('pubkey');
  }

  const params = useParams()
  let searchTag = params.searchTag

  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  // if (pubkey.includes("npub")) {
  //   // convert npub to pubkey
  //   pubkey = nip19.decode(pubkey.toString()).data.toString()
  // }

  const relayUrls = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <Head>
          <title>LUMINA.rocks</title>
          <meta name="description" content="Yet another nostr web ui" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="py-6 px-6">
          <div className='grid grid-cols-1 gap-6' >
            <SearchProfilesBox searchTag={searchTag.toString()} />
            <SearchNotesBox searchTag={searchTag.toString()} />
          </div>
        </div>
      </NostrProvider>
    </>
  );
}
