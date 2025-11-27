/**
 * Verify and fetch pubkey from NIP-05 identifier
 */
export async function verifyAndGetPubkey(nip05: string): Promise<string | null> {
  try {
    // Parse the NIP-05 identifier (name@domain.com)
    const [name, domain] = nip05.split('@');
    if (!name || !domain) {
      return null;
    }

    // Fetch the .well-known/nostr.json file
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Get the pubkey
    const pubkey = data.names?.[name];
    if (!pubkey) {
      return null;
    }

    return pubkey;
  } catch {
    return null;
  }
}

/**
 * Check if a string looks like a NIP-05 identifier
 */
export function isNIP05Format(input: string): boolean {
  // Simple check: contains @ and at least one dot after @
  const parts = input.split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1].includes('.');
}
