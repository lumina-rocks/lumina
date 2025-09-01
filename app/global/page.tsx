"use client";

import GlobalFeed from "@/components/GlobalFeed";
import GlobalQuickViewFeed from "@/components/GlobalQuickViewFeed";
import ReelFeed from "@/components/ReelFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GridIcon, SectionIcon, PlayIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

export default function GlobalFeedPage() {

  useEffect(() => {
    document.title = `Global Feed | LUMINA`;
  }, []);

  return (
    <div className="py-4 px-2 md:py-6 md:px-6">
      {/* <h2 className="text-2xl font-bold mb-4">Global Feed</h2> */}
      <Tabs defaultValue="Feed">
        <TabsList className="mb-4 w-full grid grid-cols-3">
          <TabsTrigger value="Feed">Feed</TabsTrigger>
          <TabsTrigger value="Reels"><PlayIcon /></TabsTrigger>
          <TabsTrigger value="Extended"><SectionIcon /></TabsTrigger>
        </TabsList>
        <TabsContent value="Feed">
          <GlobalQuickViewFeed />
        </TabsContent>
        <TabsContent value="Reels">
          <ReelFeed />
        </TabsContent>
        <TabsContent value="Extended">
          <GlobalFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
