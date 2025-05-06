'use client';

import Head from "next/head";
import { useNostrEvents } from "nostr-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TagCard from "@/components/TagCard";

export default function TagPage() {
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  
  let pubkey = '';
  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem("pubkey") ?? '';
  }

  const { events: followEvents, isLoading: isFollowLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      limit: 1,
      authors: [pubkey],
    },
  });

  const { events: globalEvents, isLoading: isGlobalLoading } = useNostrEvents({
    filter: {
      kinds: [20],
      limit: 100,
    },
  });

  // Extract tags from followed users
  const followedTags = followEvents
    .flatMap(event => event.tags)
    .filter(tag => tag[0] === 't')
    .map(tag => tag[1]);
  
  // Get unique followed tags
  const uniqueFollowedTags = Array.from(new Set(followedTags));

  // Extract tags from global feed for trending tags
  useEffect(() => {
    if (globalEvents.length > 0) {
      const allTags = globalEvents
        .flatMap(event => event.tags)
        .filter(tag => tag[0] === 't')
        .map(tag => tag[1]);
      
      // Count tag occurrences to find trending tags
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Sort by frequency and get top 20
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 20);
      
      // Only update state if the tags have actually changed
      if (JSON.stringify(sortedTags) !== JSON.stringify(trendingTags)) {
        setTrendingTags(sortedTags);
      }
    }
  }, [globalEvents, trendingTags]); // Depend on the full trendingTags array to capture content and order changes

  return (
    <>
      <Head>
        <title>LUMINA.rocks - Tags</title>
        <meta name="description" content="Explore tags on LUMINA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="px-2 md:px-6">
        <Tabs defaultValue="trending" className="mt-4">
          <TabsList className="mb-4 w-full grid grid-cols-1">
            <TabsTrigger value="trending">Trending Tags</TabsTrigger>
            {/* {pubkey && <TabsTrigger value="followed">My Tags</TabsTrigger>} */}
          </TabsList>
          
          <TabsContent value="trending">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isGlobalLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-[110px] rounded-xl" />
                  </div>
                ))
              ) : trendingTags.length > 0 ? (
                trendingTags.map(tag => (
                  <TagCard key={tag} tag={tag} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No trending tags found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {pubkey && (
            <TabsContent value="followed">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isFollowLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-[110px] rounded-xl" />
                    </div>
                  ))
                ) : uniqueFollowedTags.length > 0 ? (
                  uniqueFollowedTags.map(tag => (
                    <TagCard key={tag} tag={tag} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No followed tags found. Follow tags to see them here.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
