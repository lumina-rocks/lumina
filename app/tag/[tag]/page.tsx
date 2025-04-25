'use client';

import Head from "next/head";
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import TagFeed from "@/components/TagFeed";
import { useEffect } from "react";
import TagQuickViewFeed from "@/components/TagQuickViewFeed";

export default function Home() {

  const params = useParams()
  let tag = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  useEffect(() => {
    document.title = `#${tag} | LUMINA`;
  }, [tag]);


  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  // if (pubkey.includes("npub")) {
  //   // convert npub to pubkey
  //   pubkey = nip19.decode(pubkey.toString()).data.toString()
  // }

  return (
    <>
      <Head>
        <title>LUMINA.rocks - {tag}</title>
        <meta name="description" content="Yet another nostr web ui" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="py-4 px-2 md:py-6 md:px-6">
        <Tabs defaultValue="QuickView">
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="QuickView"><GridIcon /></TabsTrigger>
            <TabsTrigger value="ProfileFeed"><SectionIcon /></TabsTrigger>
          </TabsList>
          <TabsContent value="QuickView">
            <TagQuickViewFeed tag={tag} />
          </TabsContent>
          <TabsContent value="ProfileFeed">
            <TagFeed tag={tag} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
