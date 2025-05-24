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
          themes={["light", "dark", "purple-light", "purple-dark", "vintage-light", "vintage-dark", "neo-brutalism-light", "neo-brutalism-dark", "nature-light", "nature-dark", "system"]}
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