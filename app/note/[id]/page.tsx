'use client';

import Head from "next/head";
import { useParams } from 'next/navigation'
import NotePageComponent from "@/components/NotePageComponent";
import { nip19 } from "nostr-tools";
import { NostrProvider } from "nostr-react";

export default function NotePage() {

  const params = useParams()
  let id = params.id

  if (id.includes("note1")) {
    id = nip19.decode(id.toString()).data.toString()
  }

  const relayUrls = [
    "wss://relay.nostr.band",
  ];

  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <Head>
          <title>LUMINA.rocks - {id}</title>
          <meta name="description" content="Yet another nostr web ui" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="py-6 px-6">
          <div className="pb-6">
            <NotePageComponent id={id.toString()} />
          </div>
        </div>
      </NostrProvider>
    </>
  );
}
