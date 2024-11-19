'use client';

import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import ProfileQuickViewFeed from "@/components/ProfileQuickViewFeed";
import ProfileTextFeed from "@/components/ProfileTextFeed";
import { NostrProvider } from "nostr-react";
import ProfileGalleryViewFeed from "@/components/ProfileGalleryViewFeed";

export default function ProfilePage() {

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
        <div className="md:px-6">
          <div>
            <ProfileInfoCard pubkey={pubkey.toString()} />
          </div>
          <Tabs className="w-full" defaultValue="QuickView">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="QuickView"><GridIcon /></TabsTrigger>
              <TabsTrigger value="ProfileFeed"><SectionIcon /></TabsTrigger>
              <TabsTrigger value="ProfileTextFeed">Notes</TabsTrigger>
              {/* <TabsTrigger value="Gallery">Gallery</TabsTrigger> */}
            </TabsList>
            <TabsContent value="QuickView">
              <ProfileQuickViewFeed pubkey={pubkey.toString()} />
            </TabsContent>
            <TabsContent value="ProfileFeed">
              <ProfileFeed pubkey={pubkey.toString()} />
            </TabsContent>
            <TabsContent value="ProfileTextFeed">
              <ProfileTextFeed pubkey={pubkey.toString()} />
            </TabsContent>
            {/* <TabsContent value="Gallery">
              <ProfileGalleryViewFeed pubkey={pubkey.toString()} />
            </TabsContent> */}
          </Tabs>
        </div>
      </NostrProvider>
    </>
  );
}
