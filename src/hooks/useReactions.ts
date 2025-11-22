import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import type { Event } from 'nostr-tools';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useReactions(target: Event | Event[]) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  // Handle the case where an empty array is passed
  const actualTarget = Array.isArray(target) ? (target.length > 0 ? target[0] : null) : target;

  const { data: reactionEvents, ...query } = useQuery<NostrEvent[], Error>({
    queryKey: ['reactions', actualTarget?.id],
    staleTime: 30000, // 30 seconds
    refetchInterval: (query) => {
      // Only refetch if the query is currently being observed (component is mounted)
      return query.getObserversCount() > 0 ? 60000 : false;
    },
    queryFn: async (c) => {
      if (!actualTarget) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for reactions (kind 7) for this specific event
      if (actualTarget.kind >= 30000 && actualTarget.kind < 40000) {
        // Addressable event
        const identifier = actualTarget.tags.find((t) => t[0] === 'd')?.[1] || '';
        const events = await nostr.query([{
          kinds: [7],
          '#a': [`${actualTarget.kind}:${actualTarget.pubkey}:${identifier}`],
        }], { signal });
        return events;
      } else {
        // Regular event
        const events = await nostr.query([{
          kinds: [7],
          '#e': [actualTarget.id],
        }], { signal });
        return events;
      }
    },
    enabled: !!actualTarget?.id,
  });

  // Process reaction events
  const { reactionCount, userHasReacted, reactions } = useMemo(() => {
    if (!reactionEvents || !Array.isArray(reactionEvents) || !actualTarget) {
      return { reactionCount: 0, userHasReacted: false, reactions: [] };
    }

    // Filter for "like" reactions (content is "+" or empty)
    const likeReactions = reactionEvents.filter(reaction => {
      const content = reaction.content.trim();
      return content === '+' || content === '';
    });

    const count = likeReactions.length;
    const hasReacted = user ? likeReactions.some(r => r.pubkey === user.pubkey) : false;

    return {
      reactionCount: count,
      userHasReacted: hasReacted,
      reactions: likeReactions
    };
  }, [reactionEvents, actualTarget, user]);

  return {
    reactionCount,
    userHasReacted,
    reactions,
    isLoading: query.isLoading,
  };
}
