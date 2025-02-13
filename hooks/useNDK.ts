import { useContext, useEffect, useState } from 'react';
import { NDKContext } from '@/app/layout';
import { NDKFilter, NDKSubscription, NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

export function useNDK() {
  const ndk = useContext(NDKContext);
  if (!ndk) throw new Error('NDK context not found');
  return ndk;
}

export function useProfile(pubkey: string) {
  const ndk = useNDK();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey) {
      setLoading(false);
      return;
    }
    
    const user = ndk.getUser({ pubkey });
    user.fetchProfile().then((profile) => {
      setProfile(profile);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => {
      // Cleanup if needed
    };
  }, [ndk, pubkey]);

  return { data: profile, isLoading: loading };
}

export function useNostrEvents({ filter }: { filter: NDKFilter }) {
  const ndk = useNDK();
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filter) {
      setLoading(false);
      return;
    }
    
    const sub = ndk.subscribe(filter, { closeOnEose: false });
    const eventList: NDKEvent[] = [];

    sub.on('event', (event: NDKEvent) => {
      eventList.push(event);
      setEvents([...eventList].sort((a, b) => b.created_at - a.created_at));
    });

    sub.on('eose', () => {
      setLoading(false);
    });

    return () => {
      sub.stop();
    };
  }, [ndk, JSON.stringify(filter)]);

  return { events, isLoading: loading };
}

// Helper function to publish events
export async function publishEvent(ndk: NDKEvent['ndk'], event: Partial<NDKEvent>) {
  return await ndk.publish(event);
}