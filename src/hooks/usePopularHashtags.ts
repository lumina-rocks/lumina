import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

interface HashtagCount {
  tag: string;
  count: number;
}

/**
 * Hook for fetching popular hashtags from kind 20 (NIP-68) picture events
 * Returns hashtags sorted by frequency
 */
export function usePopularHashtags(limit: number = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['popular-hashtags', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      
      // Query recent kind 20 events to extract hashtags
      const events = await nostr.query([{ kinds: [20], limit: 500 }], { signal });

      // Count hashtag occurrences
      const hashtagMap = new Map<string, number>();
      
      events.forEach((event: NostrEvent) => {
        // Extract 't' tags (hashtags)
        const hashtags = event.tags.filter(([name]) => name === 't');
        
        hashtags.forEach(([_, tag]) => {
          if (tag) {
            const normalizedTag = tag.toLowerCase();
            hashtagMap.set(normalizedTag, (hashtagMap.get(normalizedTag) || 0) + 1);
          }
        });
      });

      // Convert to array and sort by count
      const sortedHashtags: HashtagCount[] = Array.from(hashtagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sortedHashtags;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
