'use client';

import { Metadata } from "next";
import "./globals.css";
import { NostrProvider, useNostr } from "nostr-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script";
import Umami from "@/components/Umami";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

// Component to show alert when no relays are connected
function NoRelaysAlert() {
  const nostr = useNostr();
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Check if there are any connected relays
    if (nostr && nostr.connectedRelays && nostr.connectedRelays.length === 0) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [nostr]);
  
  if (!showAlert) return null;
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="fixed top-16 left-0 right-0 mx-auto w-full max-w-md z-50 p-4">
      <div className="bg-red-600 dark:bg-red-800 text-white p-4 rounded-md shadow-lg flex flex-col items-center">
        <p className="font-semibold mb-2">No relays connected</p>
        <p className="text-sm mb-3">Unable to connect to any Nostr relays. Please check your connection.</p>
        <button 
          onClick={handleRefresh}
          className="bg-white text-red-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          Refresh Connection
        </button>
      </div>
    </div>
  );
}

// This wrapper component will be placed inside the NostrProvider
function NostrContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoRelaysAlert />
      {children}
    </>
  );
}

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
        >
          <TopNavigation />
          <Toaster />
          <Umami />
          <div className="main-content pb-14">
            <NostrProvider relayUrls={relayUrls} debug={false}>
              <NostrContent>
                {children}
              </NostrContent>
            </NostrProvider>
          </div>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}