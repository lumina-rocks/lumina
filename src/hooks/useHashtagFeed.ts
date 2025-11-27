import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook for fetching kind 20 (NIP-68) picture events filtered by hashtag with infinite scroll
 */
export function useHashtagFeed(hashtag: string) {
  const { nostr } = useNostr();
  const normalizedTag = hashtag.toLowerCase();
  
  // Search for both normalized and original tag if they differ
  const tagsToSearch = normalizedTag === hashtag 
    ? [normalizedTag] 
    : [normalizedTag, hashtag];

  return useInfiniteQuery({
    queryKey: ['hashtag-feed', normalizedTag],
    queryFn: async ({ pageParam, signal }) => {
      const filter = pageParam
        ? { kinds: [20], '#t': tagsToSearch, limit: 20, until: pageParam as number }
        : { kinds: [20], '#t': tagsToSearch, limit: 20 };

      const events = await nostr.query([filter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(1500)])
      });

      return events as NostrEvent[];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      // Subtract 1 since 'until' is inclusive
      return lastPage[lastPage.length - 1].created_at - 1;
    },
    initialPageParam: undefined as number | undefined,
    enabled: !!hashtag,
  });
}
