'use client';

import "./globals.css";
import { NostrProvider } from "nostr-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Toaster } from "@/components/ui/toaster"
import Umami from "@/components/Umami";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";
import { getRelayConfig } from "@/utils/nip65Utils";

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
    // Load relay configuration from localStorage
    try {
      const config = getRelayConfig();
      
      // Use inbox relays for the NostrProvider (for reading events)
      setRelayUrls(config.inbox);
    } catch (error) {
      console.error("Error loading relay configuration:", error);
      // Fallback to default relays
      setRelayUrls([
        "wss://relay.nostr.band",
        "wss://relay.damus.io",
      ]);
    }

    // Suppress unhandled promise rejection errors from nostr-tools
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if the error is related to nostr authentication or WebSocket handling
      if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
        const message = event.reason.message;
        if (message.includes('auth-required') || message.includes('auth required')) {
          console.warn('Suppressed nostr authentication error:', message);
          event.preventDefault();
          return;
        }
      }
      
      // Check if the error is from nostr-tools WebSocket handling
      if (event.reason && typeof event.reason === 'object' && 'stack' in event.reason) {
        const stack = event.reason.stack;
        if (stack && typeof stack === 'string' && 
            (stack.includes('handleNext') || stack.includes('index.js:544'))) {
          console.warn('Suppressed nostr WebSocket error:', event.reason);
          event.preventDefault();
          return;
        }
      }
      
      // For other unhandled rejections, let them through
      console.error('Unhandled promise rejection:', event.reason);
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Handle uncaught errors
    const handleUncaughtError = (event: ErrorEvent) => {
      // Check if the error is from nostr-tools WebSocket handling
      if (event.error && typeof event.error === 'object' && 'stack' in event.error) {
        const stack = event.error.stack;
        if (stack && typeof stack === 'string' && 
            (stack.includes('handleNext') || stack.includes('index.js:544'))) {
          console.warn('Suppressed nostr WebSocket error:', event.error);
          event.preventDefault();
          return;
        }
      }
      
      // For other uncaught errors, let them through
      console.error('Uncaught error:', event.error);
    };
    
    window.addEventListener('error', handleUncaughtError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleUncaughtError);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
        <title>LUMINA</title>
        <meta name="description" content="An effortless, enjoyable, and innovative way to capture, enhance, and share moments with everyone, decentralized and boundless." />
      </head>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "purple-light", "purple-dark", "vintage-light", "vintage-dark", "neo-brutalism-light", "neo-brutalism-dark", "nature-light", "nature-dark", "system"]}
        >
          <Umami />
          <div className="main-content pb-14">
            <ErrorBoundary>
              <NostrProvider relayUrls={relayUrls} debug={false}>
                <TopNavigation />
                <Toaster />
                {children}
              </NostrProvider>
            </ErrorBoundary>
          </div>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}