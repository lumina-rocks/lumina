"use client";

import { ReactNode, useEffect, useState } from "react";
import { NostrProvider } from "nostr-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Toaster } from "@/components/ui/toaster";
import Umami from "@/components/Umami";

type ClientProvidersProps = {
  children: ReactNode;
};

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [relayUrls, setRelayUrls] = useState<string[]>([
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customRelays");
      const customRelays: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(customRelays) && customRelays.length > 0) {
        const sanitizedRelays = customRelays
          .filter((r): r is string => typeof r === "string")
          .map((relay) => (relay.endsWith("/") ? relay.slice(0, -1) : relay));
        setRelayUrls((prev) => Array.from(new Set([...prev, ...sanitizedRelays])));
      }
    } catch (error) {
      console.error("Error loading custom relays:", error);
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      themes={[
        "light",
        "dark",
        "purple-light",
        "purple-dark",
        "vintage-light",
        "vintage-dark",
        "neo-brutalism-light",
        "neo-brutalism-dark",
        "nature-light",
        "nature-dark",
        "system",
      ]}
    >
      <Umami />
      <div className="main-content pb-14">
        <NostrProvider relayUrls={relayUrls} debug={false}>
          <TopNavigation />
          <Toaster />
          {children}
        </NostrProvider>
      </div>
      <BottomBar />
    </ThemeProvider>
  );
}
