import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientProviders from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LUMINA",
  description:
    "An effortless, enjoyable, and innovative way to capture, enhance, and share moments with everyone, decentralized and boundless.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}