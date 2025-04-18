import { SimplePool, Filter, Event } from 'nostr-tools';

// Interface for NIP-65 relay with read/write permissions
export interface Nip65Relay {
  url: string;
  read: boolean;
  write: boolean;
}

/**
 * Fetches NIP-65 relay list metadata for a specific user
 * @param pubkey User's public key
 * @param relays Relays to query for NIP-65 events
 * @returns Object with parsed relay permissions
 */
export async function fetchNip65Relays(pubkey: string, relays: string[]): Promise<Nip65Relay[]> {
  // Create a pool for temporary use
  const pool = new SimplePool();
  
  try {
    // Define filter for NIP-65 events (kind:10002)
    const filter: Filter = {
      kinds: [10002],
      authors: [pubkey],
      limit: 1, // We only need the most recent one
    };
    
    // Fetch the event (pool.get returns a single event or undefined)
    const latestEvent = await pool.get(relays, filter);

    if (!latestEvent) {
      return [];
    }

    // Parse the relay tags
    return parseNip65Event(latestEvent);
  } catch (error) {
    console.error('Error fetching NIP-65 relays:', error);
    return [];
  } finally {
    // Close the pool to clean up connections
    pool.close(relays);
  }
}

/**
 * Parses a NIP-65 event and extracts relay information
 * @param event NIP-65 event (kind:10002)
 * @returns Array of relays with read/write permissions
 */
export function parseNip65Event(event: Event): Nip65Relay[] {
  if (event.kind !== 10002) {
    return [];
  }
  
  const relays: Nip65Relay[] = [];
  
  // Process each 'r' tag
  for (const tag of event.tags) {
    if (tag[0] === 'r' && tag[1]) {
      const url = tag[1];
      const permission = tag[2]?.toLowerCase();
      
      // Default is both read and write if no permission specified
      relays.push({
        url,
        read: permission ? permission.includes('read') : true,
        write: permission ? permission.includes('write') : true
      });
    }
  }
  
  return relays;
}

/**
 * Merges NIP-65 relays with existing custom relays and stores in localStorage
 * @param nip65Relays NIP-65 relays to merge
 */
export function mergeAndStoreRelays(nip65Relays: Nip65Relay[]): string[] {
  try {
    // Get existing custom relays
    const existingRelays = JSON.parse(localStorage.getItem("customRelays") || "[]");
    
    // Extract URLs from NIP-65 relays (we'll add all relays for now, both read and write)
    const nip65RelayUrls = nip65Relays.map(relay => relay.url);
    
    // Merge existing and NIP-65 relays, removing duplicates
    const mergedRelays = Array.from(new Set([...existingRelays, ...nip65RelayUrls]));
    
    // Store updated list
    localStorage.setItem("customRelays", JSON.stringify(mergedRelays));
    
    return mergedRelays;
  } catch (error) {
    console.error('Error merging relays:', error);
    return [];
  }
}