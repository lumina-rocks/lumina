import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook for fetching a single kind 20 picture event by ID
 */
export function usePictureEvent(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['picture-event', eventId],
    queryFn: async ({ signal }) => {
      if (!eventId) return null;

      const events = await nostr.query([{ ids: [eventId] }], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(1500)])
      });

      // Validate that it's a kind 20 event
      const event = events[0];
      if (event && event.kind === 20) {
        return event as NostrEvent;
      }

      return null;
    },
    enabled: !!eventId,
  });
}
