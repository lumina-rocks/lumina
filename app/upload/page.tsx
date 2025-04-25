'use client';

import Head from "next/head";
import { useEffect } from "react";
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
      <div className="py-2 px-2">
        <UploadComponent />
      </div>
    </>
  );
}