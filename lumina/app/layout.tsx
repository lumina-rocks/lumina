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
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // handle Amber Sign Response
    const urlParams = new URLSearchParams(window.location.search);
    const amberSignResponse = urlParams.get('amberSignResponse');
    if (amberSignResponse !== null) {
      alert(amberSignResponse);
    }
  }, []);

  const relayUrls = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ];

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