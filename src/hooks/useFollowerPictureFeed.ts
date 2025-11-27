import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from './useCurrentUser';

/**
 * Hook for fetching kind 20 (NIP-68) picture events from followed users with infinite scroll
 * Uses NIP-02 follow list to filter events
 */
export function useFollowerPictureFeed() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: ['follower-picture-feed', user?.pubkey],
    queryFn: async ({ pageParam, signal }) => {
      if (!user?.pubkey) {
        return [];
      }

      // First, fetch the user's follow list (kind 3, NIP-02)
      const followListEvents = await nostr.query(
        [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]) }
      );

      if (followListEvents.length === 0) {
        return [];
      }

      // Extract followed pubkeys from p tags
      const followedPubkeys = followListEvents[0].tags
        .filter(([tag]) => tag === 'p')
        .map(([, pubkey]) => pubkey)
        .filter(Boolean);

      if (followedPubkeys.length === 0) {
        return [];
      }

      // Fetch pictures from followed users
      const filter = pageParam
        ? { kinds: [20], authors: followedPubkeys, limit: 20, until: pageParam as number }
        : { kinds: [20], authors: followedPubkeys, limit: 20 };

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
    enabled: !!user?.pubkey,
  });
}
