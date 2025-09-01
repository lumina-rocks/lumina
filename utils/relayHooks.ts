import { useMemo } from 'react';
import { getRelayConfig, getReadRelays, getWriteRelays } from './nip65Utils';
import { useState, useEffect } from 'react';

/**
 * Hook to get the appropriate relays for reading events
 * @param targetPubkey Optional pubkey to get their read relays (for NIP-65)
 * @returns Array of relay URLs to use for reading
 */
export function useReadRelays(targetPubkey?: string): string[] {
  return useMemo(() => {
    return getReadRelays(targetPubkey);
  }, [targetPubkey]);
}

/**
 * Hook to get the appropriate relays for publishing events
 * @param authorPubkey The pubkey of the event author
 * @returns Array of relay URLs to use for publishing
 */
export function useWriteRelays(authorPubkey?: string): string[] {
  return useMemo(() => {
    return getWriteRelays(authorPubkey);
  }, [authorPubkey]);
}

/**
 * Hook to get all relays (for backward compatibility)
 * @returns Array of all relay URLs
 */
export function useAllRelays(): string[] {
  return useMemo(() => {
    const config = getRelayConfig();
    return config.all;
  }, []);
}

/**
 * Hook to get the current user's pubkey from localStorage
 * @returns The current user's pubkey or null if not logged in
 */
export function useCurrentUserPubkey(): string | null {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedPubkey = localStorage.getItem('pubkey');
    setPubkey(storedPubkey);
  }, []);

  return isClient ? pubkey : null;
}
