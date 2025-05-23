'use client';

import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import ProfileQuickViewFeed from "@/components/ProfileQuickViewFeed";
import ProfileTextFeed from "@/components/ProfileTextFeed";
import ProfileGalleryViewFeed from "@/components/ProfileGalleryViewFeed";
import { useProfile } from "nostr-react";
import { useMemo, useEffect } from "react";

export default function ProfilePage() {

  const params = useParams()
  let pubkey = Array.isArray(params.pubkey) ? params.pubkey[0] : params.pubkey;
  // check if pubkey contains "npub" or "nprofile"
  // if so, we need to convert it to a hex pubkey
  if (pubkey.includes("npub")) {
    // convert npub to pubkey
    pubkey = nip19.decode(pubkey.toString()).data.toString()
  } else if (pubkey.includes("nprofile")) {
    // convert nprofile to pubkey
    const decoded = nip19.decode(pubkey.toString());
    if (decoded.type === 'nprofile') {
      const profileData = decoded.data as { pubkey: string; relays?: string[] };
      pubkey = profileData.pubkey;
    }
  }
  
  const npubShortened = useMemo(() => {
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    return 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
  }, [pubkey]);

  const { data: userData, isLoading } = useProfile({ pubkey });
  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;

  useEffect(() => {
    if (title) {
      document.title = `${title} | LUMINA`;
    }
  }, [title]);

  return (
    <>
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
    </>
  );
}
