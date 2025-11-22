import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook for fetching a specific user's kind 20 (NIP-68) picture events with infinite scroll
 */
export function useUserPictures(pubkey: string) {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['user-pictures', pubkey],
    queryFn: async ({ pageParam, signal }) => {
      const filter = pageParam
        ? { kinds: [20], authors: [pubkey], limit: 20, until: pageParam as number }
        : { kinds: [20], authors: [pubkey], limit: 20 };

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
    enabled: !!pubkey,
  });
}
