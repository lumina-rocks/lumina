import { Metadata } from "next";
import "./globals.css";
import { NostrProvider } from "nostr-react";
import Head from "next/head";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavigation } from "@/components/headerComponents/TopNavigation";
import BottomBar from "@/components/BottomBar";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script";

export const metadata: Metadata = {
  title: "LUMINA",
  description: "An effortless, enjoyable, and innovative way to capture, enhance, and share moments with everyone, decentralized and boundless.",
  manifest: "/manifest.json",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/manifest.json" />
        {/* <script defer src="https://umami.softwerk.cloud/script.js" data-website-id="d0495d49-1f04-4501-8711-3bdcb4f7f7bd"></script> */}
      </Head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TopNavigation />
          <Toaster />
          <Script
            src="https://umami.softwerk.cloud/script.js"
            strategy="afterInteractive"
            data-website-id="d0495d49-1f04-4501-8711-3bdcb4f7f7bd"
            defer
          />
          <div className="main-content pb-14">
            {children}
          </div>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
