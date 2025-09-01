import { Event as NostrEvent, SimplePool } from 'nostr-tools';
import { getWriteRelays } from './nip65Utils';

/**
 * Publishes an event to the appropriate outbox relays
 * @param event The signed event to publish
 * @param authorPubkey The pubkey of the event author (for determining write relays)
 * @returns Promise that resolves when the event has been published to all relays
 */
export async function publishToOutbox(event: NostrEvent, authorPubkey?: string): Promise<void> {
  console.log("publishToOutbox called with event:", event.id)
  console.log("Event kind:", event.kind)
  console.log("Event content length:", event.content?.length || 0)
  console.log("Event tags:", event.tags)
  console.log("Author pubkey:", authorPubkey)
  
  const writeRelays = getWriteRelays(authorPubkey);
  console.log("Write relays:", writeRelays)
  
  if (writeRelays.length === 0) {
    console.error("No write relays configured")
    throw new Error('No write relays configured. Please add some relays in the relay settings.');
  }
  
  const pool = new SimplePool();
  
  try {
    console.log("Publishing to relays:", writeRelays)
    
    // Publish to all write relays with timeout
    const publishPromises = writeRelays.map(async (relay) => {
      try {
        console.log(`Publishing to relay: ${relay}`)
        await pool.publish([relay], event);
        console.log(`Successfully published to ${relay}`)
        return { relay, success: true };
      } catch (error) {
        console.error(`Failed to publish to ${relay}:`, error)
        return { relay, success: false, error };
      }
    });
    
    const results = await Promise.allSettled(publishPromises);
    console.log("Publish results:", results)
    
    // Check if at least one relay succeeded
    const successfulPublishes = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    );
    
    if (successfulPublishes.length === 0) {
      console.error("Failed to publish to any relay")
      throw new Error('Failed to publish to any relay. Please check your relay configuration.');
    }
    
    console.log(`Successfully published to ${successfulPublishes.length} out of ${writeRelays.length} relays`)
  } catch (error) {
    console.error("Error in publishToOutbox:", error)
    throw error;
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
