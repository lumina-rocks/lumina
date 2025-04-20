"use client";

import GlobalFeed from "@/components/GlobalFeed";
import GlobalQuickViewFeed from "@/components/GlobalQuickViewFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GridIcon, SectionIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

export default function GlobalFeedPage() {

  useEffect(() => {
    document.title = `Global Feed | LUMINA`;
  }, []);

  return (
    <div className="py-4 px-2 md:py-6 md:px-6">
      {/* <h2 className="text-2xl font-bold mb-4">Global Feed</h2> */}
      <Tabs defaultValue="GlobalQuickViewFeed">
        <TabsList className="mb-4 w-full grid grid-cols-2">
          <TabsTrigger value="GlobalQuickViewFeed"><GridIcon /></TabsTrigger>
          <TabsTrigger value="GlobalFeed"><SectionIcon /></TabsTrigger>
        </TabsList>
        <TabsContent value="GlobalQuickViewFeed">
          <GlobalQuickViewFeed />
        </TabsContent>
        <TabsContent value="GlobalFeed">
          <GlobalFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
