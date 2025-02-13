'use client';

import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script";
import Umami from "@/components/Umami";
import NDK from '@nostr-dev-kit/ndk';
import { createContext, useMemo } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Create NDK context
export const NDKContext = createContext<NDK | null>(null);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ndk = useMemo(() => {
    const ndk = new NDK({
      explicitRelayUrls: [
        "wss://relay.nostr.band",
        "wss://relay.damus.io",
      ]
    });
    ndk.connect();
    return ndk;
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
          <NDKContext.Provider value={ndk}>
            <TopNavigation />
            <Toaster />
            <Umami />
            <div className="main-content pb-14">
              {children}
            </div>
            <BottomBar />
          </NDKContext.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}