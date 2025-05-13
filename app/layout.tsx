'use client';

import { Metadata } from "next";
import "./globals.css";
import { NostrProvider } from "nostr-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script";
import Umami from "@/components/Umami";
import { useEffect, useState } from "react";
import NDK from '@nostr-dev-kit/ndk';
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks'; // Assuming package name

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [relayUrls, setRelayUrls] = useState<string[]>([
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ]);
  
  // 1. Configure your NDK instance (e.g., in src/ndk.ts or similar)
  const ndk = new NDK({
    explicitRelayUrls: relayUrls,
    // Add signer or cache adapter if needed
  });
  
  // 2. Connect the instance immediately
  ndk.connect()
    .then(() => console.log('NDK connected'))
    .catch((e) => console.error('NDK connection error:', e));
    
  const initializeNDK = useNDKInit(); // Hook returns the function directly

  useEffect(() => {
    // 3. Initialize stores once the component mounts
    initializeNDK(ndk);
  }, [initializeNDK]); // Dependency ensures this runs if initializeNDK changes, though unlikely


  useEffect(() => {
    // Load custom relays from localStorage
    try {
      const customRelays = JSON.parse(localStorage.getItem("customRelays") || "[]");
      if (customRelays.length > 0) {
        // Remove trailing slashes from any relay URLs
        const sanitizedRelays = customRelays.map((relay: string) =>
          relay.endsWith('/') ? relay.slice(0, -1) : relay
        );

        setRelayUrls(prevRelays => {
          // Combine default relays with custom relays, removing duplicates
          const allRelays = [...prevRelays, ...sanitizedRelays];
          return Array.from(new Set(allRelays)); // Remove duplicates
        });
      }
    } catch (error) {
      console.error("Error loading custom relays:", error);
    }
  }, []);

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
            {/* <NostrProvider relayUrls={relayUrls} debug={false}> */}
            {children}
            {/* </NostrProvider> */}
          </div>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}