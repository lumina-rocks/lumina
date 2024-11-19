"use client";

import GlobalFeed from "@/components/GlobalFeed";
import { NostrProvider } from "nostr-react";

export default function Home() {

  const relayUrls = [
    "wss://relay.nostr.band",
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
        <GlobalFeed />
      </div>
    </NostrProvider>
  );
}
