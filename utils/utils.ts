import { NDKEvent } from '@nostr-dev-kit/ndk';
import { hexToBytes } from "@noble/hashes/utils";

export function getImageUrl(tags: string[][]): string {
  const rTag = tags.find(tag => tag[0] === 'r');
  return rTag ? rTag[1] : '';
}

export function extractDimensions(event: NDKEvent | any): { width: number; height: number } {
  let width = 0;
  let height = 0;

  // Try to get dimensions from dim tag
  const dimTag = event.tags.find((tag: string[]) => tag[0] === 'dim');
  if (dimTag) {
    const [w, h] = dimTag[1].split('x').map(Number);
    width = w;
    height = h;
  }

  return { width, height };
}

export async function signEvent(loginType: string | null, event: NDKEvent): Promise<NDKEvent | null> {
  try {
    if (loginType === 'extension') {
      const signedRawEvent = await window.nostr.signEvent(event.rawEvent());
      Object.assign(event, signedRawEvent);
      return event;
    } else if (loginType === 'amber') {
      alert('Signing with Amber is not implemented yet, sorry!');
      return null;
    } else if (loginType === 'raw_nsec') {
      const nsecStr = window.localStorage.getItem('nsec');
      if (!nsecStr) throw new Error('No nsec found');
      await event.sign();
      return event;
    }
  } catch (error) {
    console.error('Failed to sign event:', error);
    return null;
  }
  return null;
}

export async function publishSignedEvent(event: NDKEvent): Promise<boolean> {
  try {
    await event.publish();
    return true;
  } catch (error) {
    console.error('Failed to publish event:', error);
    return false;
  }
}

export function getEventRelays(event: NDKEvent): string[] {
  return Array.from(event.relay?.url ? [event.relay.url] : []);
}

export function validateEventSignature(event: NDKEvent): boolean {
  try {
    return event.verify();
  } catch (error) {
    console.error('Event signature validation failed:', error);
    return false;
  }
}

export function parseNpub(input: string): string | null {
  try {
    if (input.startsWith('npub1')) {
      return nip19.decode(input).data.toString();
    }
    return input;
  } catch (error) {
    console.error('Invalid npub format:', error);
    return null;
  }
}