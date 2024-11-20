"use client";

import { Search } from "@/components/Search";
import { TrendingAccounts } from "@/components/TrendingAccounts";
import { TrendingImages } from "@/components/TrendingImages";
import { NostrProvider } from "nostr-react";


export default function Home() {

  const relayUrls = [
    "wss://relay.nostr.band",
  ];
  
  return (
    <>
      <NostrProvider relayUrls={relayUrls} debug={false}>
        <div className="flex flex-col items-center py-6 px-6">
          <Search />
        </div>
        {/* <TrendingAccounts /> */}
        <TrendingImages />
      </NostrProvider>
    </>
  );
}
