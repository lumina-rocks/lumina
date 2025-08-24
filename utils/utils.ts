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
  const imetaTags = tags.filter(tag => tag[0] === 'imeta');
  
  // First, check for 'image' fields (thumbnails for videos)
  for (const imetaTag of imetaTags) {
    const imageItem = imetaTag.find(item => item.startsWith('image '));
    if (imageItem) {
      return imageItem.split(' ')[1];
    }
  }
  
  // Then, check for 'url' fields that point to images
  for (const imetaTag of imetaTags) {
    const urlItem = imetaTag.find(item => item.startsWith('url '));
    const mimeItem = imetaTag.find(item => item.startsWith('m '));
    
    if (urlItem) {
      const url = urlItem.split(' ')[1];
      // If this imeta tag has an image mime type, use it
      if (mimeItem && mimeItem.startsWith('m image/')) {
        return url;
      }
      // If the URL looks like an image, use it
      if (url.match(/\.(jpg|jpeg|png|webp|gif|apng|avif)$/i)) {
        return url;
      }
    }
  }
  
  // Fallback: return the first URL found
  const firstImetaTag = imetaTags[0];
  if (firstImetaTag) {
    const urlItem = firstImetaTag.find(item => item.startsWith('url '));
    if (urlItem) {
      return urlItem.split(' ')[1];
    }
  }
  
  return '';
}

export function getThumbnailUrl(tags: string[][]): string {
  const imetaTag = tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const imageItem = imetaTag.find(item => item.startsWith('image '));
    if (imageItem) {
      return imageItem.split(' ')[1];
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
    console.log("signEvent called with loginType:", loginType)
    console.log("Event to sign:", { kind: event.kind, content: event.content?.substring(0, 100) + "..." })
    
    // Sign event
  let eventSigned: NostrEvent = { ...event, sig: '' };
  if (loginType === 'extension') {
    try {
      console.log("Signing with extension...")
      eventSigned = await window.nostr.signEvent(event);
      console.log("Extension signing successful:", eventSigned.id)
    } catch (error) {
      console.error("Extension signing failed:", error)
      throw error
    }
  } else if (loginType === 'amber') {
    // TODO: Sign event with amber
    alert('Signing with Amber is not implemented yet, sorry!');
    return null;
  } else if (loginType === 'bunker') {
    // Sign with bunker (NIP-46)
    try {
      console.log("Signing with bunker...")
      const signedWithBunker = await signEventWithBunker(event);
      if (signedWithBunker) {
        console.log("Bunker signing successful:", signedWithBunker.id)
        return signedWithBunker;
      } else {
        console.error("Bunker signing returned null")
        alert('Failed to sign with bunker. Please check your connection and try again.');
        return null;
      }
    } catch (error) {
      console.error("Bunker signing failed:", error)
      alert(`Failed to sign with bunker: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  } else if (loginType === 'raw_nsec') {
    if (typeof window !== 'undefined') {
      try {
        console.log("Signing with raw nsec...")
        let nsecStr = null;
        nsecStr = window.localStorage.getItem('nsec');
        if (nsecStr != null) {
          eventSigned = finalizeEvent(event, hexToBytes(nsecStr));
          console.log("Raw nsec signing successful:", eventSigned.id)
        } else {
          console.error("No nsec found in localStorage")
          throw new Error("No private key found")
        }
      } catch (error) {
        console.error("Raw nsec signing failed:", error)
        throw error
      }
    }
  } else {
    console.error("Unknown login type:", loginType)
    throw new Error(`Unknown login type: ${loginType}`)
  }
  
  console.log("Final signed event:", eventSigned);
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