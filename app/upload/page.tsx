'use client';

import Head from "next/head";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfileFeed from "@/components/ProfileFeed";
import { useParams } from 'next/navigation'
import { Event, NostrEvent, finalizeEvent, nip19 } from "nostr-tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionIcon, GridIcon } from '@radix-ui/react-icons'
import TagFeed from "@/components/TagFeed";
import { FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import UploadComponent from "@/components/UploadComponent";

export default function UploadPage() {

  useEffect(() => {
    document.title = `Upload | LUMINA`;
  }, []);
  
  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  // if (pubkey.includes("npub")) {
  //   // convert npub to pubkey
  //   pubkey = nip19.decode(pubkey.toString()).data.toString()
  // }

  return (
    <>
      <Head>
        <title>LUMINA.rocks</title>
        <meta name="description" content="Yet another nostr web ui" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="py-6 px-6">
        <UploadComponent />
      </div>
    </>
  );
}