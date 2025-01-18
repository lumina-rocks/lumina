'use client';

import Head from "next/head";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import TagFeed from "@/components/TagFeed";
import FollowerFeed from "@/components/FollowerFeed";
import ProfileQuickViewFeed from "@/components/ProfileQuickViewFeed";
import FollowerQuickViewFeed from "@/components/FollowerQuickViewFeed";

export default function FeedPage() {
  let pubkey = null;
  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem('pubkey');
  }

  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  // if (pubkey.includes("npub")) {
  //   // convert npub to pubkey
  //   pubkey = nip19.decode(pubkey.toString()).data.toString()
  // }

  return (
    <>
      <Head>
        <title>LUMINA.rocks - {pubkey}</title>
        <meta name="description" content="Yet another nostr web ui" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="py-4 px-2 md:py-6 md:px-6">
        <h2 className="text-2xl font-bold mb-4 px-2 md:px-4">Follower Feed</h2>
        <Tabs defaultValue="QuickView">
          <TabsList className="mb-4">
            <TabsTrigger value="QuickView"><GridIcon /></TabsTrigger>
            <TabsTrigger value="ProfileFeed"><SectionIcon /></TabsTrigger>
          </TabsList>
          <TabsContent value="QuickView">
            <FollowerQuickViewFeed pubkey={pubkey || ''} />
          </TabsContent>
          <TabsContent value="ProfileFeed">
            <FollowerFeed pubkey={pubkey || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
