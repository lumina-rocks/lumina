import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface NotificationEvent extends NostrEvent {
  notificationType: 'reaction' | 'comment' | 'zap' | 'mention';
  targetEventId?: string;
  targetEventKind?: number;
}

/**
 * Hook for fetching notifications for the current user
 * Includes reactions, comments, zaps, and mentions
 */
export function useNotifications() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: ['notifications', user?.pubkey],
    queryFn: async ({ pageParam, signal }) => {
      if (!user) return [];

      // First, get the user's picture events (kind 20) to find what can be reacted to
      const userPicturesFilter = pageParam
        ? { kinds: [20], authors: [user.pubkey], limit: 100, until: pageParam as number }
        : { kinds: [20], authors: [user.pubkey], limit: 100 };

      const userPictures = await nostr.query([userPicturesFilter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(3000)])
      });

      const userPictureIds = userPictures.map(e => e.id);

      // Query for notifications using a single combined query
      // Reactions (kind 7), Comments (kind 1111), Zaps (kind 9735) on user's pictures
      // Plus mentions in text notes (kind 1) and comments (kind 1111)
      const notificationFilter = pageParam
        ? {
            kinds: [7, 1111, 9735, 1],
            '#e': userPictureIds.length > 0 ? userPictureIds : undefined,
            '#p': [user.pubkey],
            limit: 50,
            until: pageParam as number,
          }
        : {
            kinds: [7, 1111, 9735, 1],
            '#e': userPictureIds.length > 0 ? userPictureIds : undefined,
            '#p': [user.pubkey],
            limit: 50,
          };

      // Remove undefined filters
      if (!notificationFilter['#e']) {
        delete notificationFilter['#e'];
      }

      const events = await nostr.query([notificationFilter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(3000)])
      });

      // Filter out events by the user themselves and classify by type
      const notifications: NotificationEvent[] = events
        .filter(event => event.pubkey !== user.pubkey)
        .map(event => {
          // Determine notification type
          let notificationType: 'reaction' | 'comment' | 'zap' | 'mention' = 'mention';
          let targetEventId: string | undefined;
          let targetEventKind: number | undefined;

          if (event.kind === 7) {
            notificationType = 'reaction';
            targetEventId = event.tags.find(([name]) => name === 'e')?.[1];
          } else if (event.kind === 1111) {
            notificationType = 'comment';
            // Get the root event being commented on
            const ETag = event.tags.find(([name]) => name === 'E')?.[1];
            const eTag = event.tags.find(([name]) => name === 'e')?.[1];
            targetEventId = ETag || eTag;
          } else if (event.kind === 9735) {
            notificationType = 'zap';
            targetEventId = event.tags.find(([name]) => name === 'e')?.[1];
          } else if (event.kind === 1) {
            // Check if it's a mention or a reply
            const pTags = event.tags.filter(([name]) => name === 'p');
            const eTags = event.tags.filter(([name]) => name === 'e');
            
            // If it has e-tags, it might be a reply to user's content
            if (eTags.length > 0) {
              notificationType = 'mention';
              targetEventId = eTags[eTags.length - 1]?.[1]; // Get the reply target
            } else {
              notificationType = 'mention';
            }
          }

          return {
            ...event,
            notificationType,
            targetEventId,
            targetEventKind,
          } as NotificationEvent;
        })
        .sort((a, b) => b.created_at - a.created_at); // Sort by newest first

      return notifications;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].created_at - 1;
    },
    initialPageParam: undefined as number | undefined,
    enabled: !!user,
  });
}
