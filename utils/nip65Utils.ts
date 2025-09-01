import { SimplePool, Filter, Event } from 'nostr-tools';

// Interface for NIP-65 relay with read/write permissions
export interface Nip65Relay {
  url: string;
  read: boolean;
  write: boolean;
}

// Interface for relay configuration
export interface RelayConfig {
  inbox: string[];  // Read relays
  outbox: string[]; // Write relays
  all: string[];    // All relays (for backward compatibility)
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
 * Gets the current relay configuration from localStorage
 * @returns RelayConfig object with inbox, outbox, and all relays
 */
export function getRelayConfig(): RelayConfig {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Return default config for server-side rendering
    return {
      inbox: ["wss://relay.nostr.band", "wss://relay.damus.io", "wss://nos.lol"],
      outbox: ["wss://relay.nostr.band", "wss://relay.damus.io", "wss://nos.lol"],
      all: ["wss://relay.nostr.band", "wss://relay.damus.io", "wss://nos.lol"]
    };
  }

  try {
    const customRelays = JSON.parse(localStorage.getItem("customRelays") || "[]");
    const nip65Relays = JSON.parse(localStorage.getItem("nip65Relays") || "[]");
    
    // Default relays - updated with more reliable options
    const defaultRelays = [
      "wss://relay.nostr.band",
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://freelay.sovbit.host"
    ];
    
    // Combine all relays
    const allRelays = Array.from(new Set([...defaultRelays, ...customRelays, ...nip65Relays]));
    
    // Filter out localhost relays to prevent connection errors
    const filteredRelays = allRelays.filter(relay => {
      try {
        const url = new URL(relay);
        return !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1');
      } catch {
        // If URL parsing fails, keep the relay
        return true;
      }
    });
    
    // Only log once per session to reduce console spam
    if (!(window as any).__relayConfigLogged) {
      console.log("Relay configuration:", {
        customRelays,
        nip65Relays,
        defaultRelays,
        allRelays,
        filteredRelays
      });
      (window as any).__relayConfigLogged = true;
    }
    
    // For now, use all relays for both inbox and outbox
    // In the future, this could be more sophisticated based on NIP-65 permissions
    return {
      inbox: filteredRelays,
      outbox: filteredRelays,
      all: filteredRelays
    };
  } catch (error) {
    console.error('Error getting relay config:', error);
    // Fallback to basic relays
    const fallbackRelays = [
      "wss://relay.nostr.band",
      "wss://relay.damus.io",
      "wss://nos.lol",
    ];
    return {
      inbox: fallbackRelays,
      outbox: fallbackRelays,
      all: fallbackRelays
    };
  }
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
    
    // Store NIP-65 relays separately for future use
    localStorage.setItem("nip65Relays", JSON.stringify(nip65RelayUrls));
    
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

/**
 * Gets the appropriate relays for reading events
 * @param targetPubkey Optional pubkey to get their read relays (for NIP-65)
 * @returns Array of relay URLs to use for reading
 */
export function getReadRelays(targetPubkey?: string): string[] {
  const config = getRelayConfig();
  
  // If we have a target pubkey, we could fetch their NIP-65 relays
  // For now, use the current user's inbox
  return config.inbox;
}

/**
 * Gets the appropriate relays for publishing events
 * @param authorPubkey The pubkey of the event author
 * @returns Array of relay URLs to use for publishing
 */
export function getWriteRelays(authorPubkey?: string): string[] {
  const config = getRelayConfig();
  
  // For now, use the current user's outbox
  // In the future, this could include the author's write relays from NIP-65
  return config.outbox;
}