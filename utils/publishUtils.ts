import { Event as NostrEvent, SimplePool } from 'nostr-tools';
import { getWriteRelays } from './nip65Utils';

/**
 * Publishes an event to the appropriate outbox relays
 * @param event The signed event to publish
 * @param authorPubkey The pubkey of the event author (for determining write relays)
 * @returns Promise that resolves when the event has been published to all relays
 */
export async function publishToOutbox(event: NostrEvent, authorPubkey?: string): Promise<void> {
  const writeRelays = getWriteRelays(authorPubkey);
  
  if (writeRelays.length === 0) {
    throw new Error('No write relays configured');
  }
  
  const pool = new SimplePool();
  
  try {
    // Publish to all write relays
    await pool.publish(writeRelays, event);
  } finally {
    // Close the pool to clean up connections
    pool.close(writeRelays);
  }
}

/**
 * Publishes an event to all configured relays (legacy function for backward compatibility)
 * @param event The signed event to publish
 * @returns Promise that resolves when the event has been published to all relays
 */
export async function publishToAllRelays(event: NostrEvent): Promise<void> {
  const { getRelayConfig } = await import('./nip65Utils');
  const config = getRelayConfig();
  
  if (config.all.length === 0) {
    throw new Error('No relays configured');
  }
  
  const pool = new SimplePool();
  
  try {
    // Publish to all relays
    await pool.publish(config.all, event);
  } finally {
    // Close the pool to clean up connections
    pool.close(config.all);
  }
}
