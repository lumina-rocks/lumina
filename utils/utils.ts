import { Event as NostrEvent, finalizeEvent} from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils"
import { signEventWithBunker } from "./bunkerUtils";

// Check if the event has nsfw or sexy tags
export function hasNsfwContent(tags: string[][]): boolean {
  return tags.some(tag => 
    (tag[0] === 't' && (tag[1]?.toLowerCase() === 'nsfw' || tag[1]?.toLowerCase() === 'sexy')) ||
    (tag[0] === 'content-warning')
  );
}

export function getImageUrl(tags: string[][]): string {
  const imetaTag = tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const urlItem = imetaTag.find(item => item.startsWith('url '));
    if (urlItem) {
      return urlItem.split(' ')[1];
    }
  }
  return '';
}

export function extractDimensions(event: NostrEvent): { width: number; height: number } {
  const imetaTag = event.tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const dimInfo = imetaTag.find(item => item.startsWith('dim '));
    if (dimInfo) {
      const [width, height] = dimInfo.split(' ')[1].split('x').map(Number);
      return { width, height };
    }
  }
  return { width: 500, height: 300 }; // Default dimensions if not found
}

export async function signEvent(loginType: string | null, event: NostrEvent): Promise<NostrEvent | null> {
    // Sign event
  let eventSigned: NostrEvent = { ...event, sig: '' };
  if (loginType === 'extension') {
    eventSigned = await window.nostr.signEvent(event);
  } else if (loginType === 'amber') {
    // TODO: Sign event with amber
    alert('Signing with Amber is not implemented yet, sorry!');
    return null;
  } else if (loginType === 'bunker') {
    // Sign with bunker (NIP-46)
    const signedWithBunker = await signEventWithBunker(event);
    if (signedWithBunker) {
      return signedWithBunker;
    } else {
      alert('Failed to sign with bunker. Please check your connection and try again.');
      return null;
    }
  } else if (loginType === 'raw_nsec') {
    if (typeof window !== 'undefined') {
      let nsecStr = null;
      nsecStr = window.localStorage.getItem('nsec');
      if (nsecStr != null) {
        eventSigned = finalizeEvent(event, hexToBytes(nsecStr));
      }
    }
  }
  console.log(eventSigned);
  return eventSigned;
}

// Create proxied image URL
export const getProxiedImageUrl = (url: string, width: number, height: number) => {
  if (!url.startsWith("http")) return url;
  try {
    // Encode the URL to be used in the proxy
    const encodedUrl = encodeURIComponent(url);
    const imgproxyEnv = process.env.NEXT_PUBLIC_IMGPROXY_URL;
    const imgproxyUrl = new URL(imgproxyEnv || "https://imgproxy.example.com");
    return `${imgproxyUrl}_/resize:fit:${width}:${height}/plain/${encodedUrl}`;
  } catch (error) {
    console.error("Error creating proxied image URL:", error);
    return url;
  }
}