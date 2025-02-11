'use client';

import { Metadata } from "next";
import "./globals.css";
import { NostrProvider, useNostrEvents } from "nostr-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script";
import Umami from "@/components/Umami";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let pubkey = null;
  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem('pubkey');
  }

  let relayUrls = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ];

  if (pubkey) {
    relayUrls = [];
    const { events } = useNostrEvents({
      filter: {
        kinds: [10002],
        limit: 1,
        authors: [pubkey],
      },
    });
    
    if (events.length > 0) {
      const tags = events[0].tags;
      for (let i = 0; i < tags.length; i++) {
        if (tags[i][0] === "r") {
          relayUrls.push(tags[i][1]);
        }
      }
    }
  }
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/manifest.json" />
        <title>LUMINA</title>
        <meta name="description" content="An effortless, enjoyable, and innovative way to capture, enhance, and share moments with everyone, decentralized and boundless." />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TopNavigation />
          <Toaster />
          <Umami />
          <div className="main-content pb-14">
            <NostrProvider relayUrls={relayUrls} debug={false}>
              {children}
            </NostrProvider>
          </div>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}