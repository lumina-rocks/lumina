import { SimplePool } from 'nostr-tools';
import { BunkerSigner, parseBunkerInput } from 'nostr-tools/nip46';

/**
 * Converts a hex string to a Uint8Array.
 * @param hex The hex string to convert.
 * @returns Uint8Array representation of the hex string.
 */
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Creates a BunkerSigner instance from the stored bunker connection information
 * @returns A Promise that resolves to a BunkerSigner instance or null if not using bunker login
 */
export async function getBunkerSigner(): Promise<{
  signer: BunkerSigner;
  pool: SimplePool;
} | null> {
  // Check if user is logged in with bunker
  const loginType = localStorage.getItem("loginType");
  if (loginType !== "bunker") return null;

  // Get the stored bunker connection info
  const localKeyHex = localStorage.getItem("bunkerLocalKey");
  const bunkerUrl = localStorage.getItem("bunkerUrl");
  
  if (!localKeyHex || !bunkerUrl) return null;
  
  try {
    // Convert hex to Uint8Array for the local key
    const localKey = hexToBytes(localKeyHex);
    
    // Parse the bunker URL
    const bunkerPointer = await parseBunkerInput(bunkerUrl);
    if (!bunkerPointer) throw new Error('Invalid bunker URL');
    
    // Create pool and bunker signer
    const pool = new SimplePool();
    const signer = new BunkerSigner(localKey, bunkerPointer, { pool });
    
    // Connect to the bunker
    await signer.connect();
    
    return { signer, pool };
  } catch (error) {
    console.error('Error creating bunker signer:', error);
    return null;
  }
}

/**
 * Signs an event using the appropriate method based on login type
 * @param event The unsigned event to sign
 * @returns A Promise that resolves to the signed event or null if signing failed
 */
export async function signEventWithBunker(event: any): Promise<any | null> {
  const loginType = localStorage.getItem("loginType");
  
  if (loginType === "bunker") {
    const bunkerConnection = await getBunkerSigner();
    if (!bunkerConnection) return null;
    
    try {
      const { signer, pool } = bunkerConnection;
      
      // Sign the event using the bunker
      const signedEvent = await signer.signEvent(event);
      
      // Clean up
      await signer.close();
      pool.close([]);
      
      return signedEvent;
    } catch (error) {
      console.error('Error signing with bunker:', error);
      return null;
    }
  }
  
  return null;
}