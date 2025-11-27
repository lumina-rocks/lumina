import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface SearchOptions {
  query: string;
  kinds?: number[];
  limit?: number;
}

/**
 * Hook for NIP-50 search functionality
 * Searches for Nostr events using relay search capabilities
 */
export function useSearch({ query, kinds = [0, 1], limit = 20 }: SearchOptions) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['search', query, kinds, limit],
    queryFn: async ({ signal }) => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      try {
        const events = await nostr.query(
          [{
            kinds,
            search: query.trim(),
            limit,
          }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) }
        );

        return events;
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}
