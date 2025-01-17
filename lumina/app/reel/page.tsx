"use client";

import ReelFeed from "@/components/ReelFeed"
import { NostrProvider } from "nostr-react";

export default function ReelPage() {
  const relayUrls = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
  ];

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    // </main>
    // <NavigationMenu>
    //   <NavigationMenuList>
    //     <NavigationMenuItem>
    //       <Link href="/" legacyBehavior passHref>
    //         <NavigationMenuLink className={navigationMenuTriggerStyle()}>
    //           Home
    //         </NavigationMenuLink>
    //       </Link>
    //     </NavigationMenuItem>
    //   </NavigationMenuList>
    // </NavigationMenu>
    <NostrProvider relayUrls={relayUrls} debug={false}>
      <div className="py-6 px-6">
        <ReelFeed />
      </div>
    </NostrProvider>
  );
}
